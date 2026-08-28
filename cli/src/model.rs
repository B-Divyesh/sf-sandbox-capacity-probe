use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProbeConfig {
    pub target: String,
    pub runtime: String,
    pub context: String,
    pub containers: u16,
    pub ports_per_container: u16,
    pub mounts_per_container: u16,
    pub samples: u16,
    pub startup_budget_ms: u64,
    pub image: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Observation {
    pub sample: u16,
    pub active_containers: u16,
    pub startup_ms: f64,
    pub published_bindings: u64,
    pub host_network_rule_count: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LevelSummary {
    pub active_containers: u16,
    pub starts: usize,
    pub p50_ms: f64,
    pub p95_ms: f64,
    pub published_bindings: u64,
    pub host_network_rule_count: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LatencyModel {
    pub intercept_ms: f64,
    pub ms_per_published_binding: f64,
    pub predicted_p95_ms: f64,
    pub method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CapacityEnvelope {
    pub status: String,
    pub startup_budget_ms: u64,
    pub predicted_p95_ms: f64,
    pub headroom_ms: f64,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct HostEvidence {
    pub baseline_published_bindings: u64,
    pub baseline_network_rule_count: Option<u64>,
    pub rule_count_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Report {
    pub schema_version: u8,
    pub generated_at_unix_ms: u128,
    pub run_id: String,
    pub config: ProbeConfig,
    pub host: HostEvidence,
    pub observations: Vec<Observation>,
    pub levels: Vec<LevelSummary>,
    pub model: LatencyModel,
    pub envelope: CapacityEnvelope,
    pub caveats: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Comparison {
    pub predicted_p95_ms: f64,
    pub observed_p95_ms: f64,
    pub absolute_error_percent: f64,
    pub within_25_percent: bool,
    pub shape_matches: bool,
}

pub fn percentile(values: &[f64], percentile: f64) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let mut sorted = values.to_vec();
    sorted.sort_by(f64::total_cmp);
    let rank = (percentile.clamp(0.0, 1.0) * (sorted.len() - 1) as f64).ceil() as usize;
    sorted[rank]
}

pub fn summarize_levels(observations: &[Observation]) -> Vec<LevelSummary> {
    let mut levels: Vec<u16> = observations.iter().map(|o| o.active_containers).collect();
    levels.sort_unstable();
    levels.dedup();
    levels
        .into_iter()
        .map(|level| {
            let at_level: Vec<&Observation> = observations
                .iter()
                .filter(|o| o.active_containers == level)
                .collect();
            let latencies: Vec<f64> = at_level.iter().map(|o| o.startup_ms).collect();
            LevelSummary {
                active_containers: level,
                starts: at_level.len(),
                p50_ms: round1(percentile(&latencies, 0.50)),
                p95_ms: round1(percentile(&latencies, 0.95)),
                published_bindings: at_level
                    .iter()
                    .map(|o| o.published_bindings)
                    .max()
                    .unwrap_or(0),
                host_network_rule_count: at_level
                    .iter()
                    .filter_map(|o| o.host_network_rule_count)
                    .max(),
            }
        })
        .collect()
}

pub fn build_model(levels: &[LevelSummary], target_bindings: u64) -> LatencyModel {
    if levels.is_empty() {
        return LatencyModel {
            intercept_ms: 0.0,
            ms_per_published_binding: 0.0,
            predicted_p95_ms: 0.0,
            method: "no observations".into(),
        };
    }
    let points: Vec<(f64, f64)> = levels
        .iter()
        .map(|level| (level.published_bindings as f64, level.p95_ms))
        .collect();
    let mean_x = points.iter().map(|p| p.0).sum::<f64>() / points.len() as f64;
    let mean_y = points.iter().map(|p| p.1).sum::<f64>() / points.len() as f64;
    let variance = points.iter().map(|p| (p.0 - mean_x).powi(2)).sum::<f64>();
    let covariance = points
        .iter()
        .map(|p| (p.0 - mean_x) * (p.1 - mean_y))
        .sum::<f64>();
    let slope = if variance > f64::EPSILON {
        (covariance / variance).max(0.0)
    } else {
        0.0
    };
    let intercept = (mean_y - slope * mean_x).max(0.0);
    let observed_at_target = levels.last().map(|level| level.p95_ms).unwrap_or_default();
    let predicted = (intercept + slope * target_bindings as f64).max(observed_at_target);
    LatencyModel {
        intercept_ms: round1(intercept),
        ms_per_published_binding: round1(slope),
        predicted_p95_ms: round1(predicted),
        method: "non-negative least-squares trend over level p95 values; never below observed target p95".into(),
    }
}

pub fn capacity_envelope(predicted_p95_ms: f64, budget_ms: u64) -> CapacityEnvelope {
    let ratio = predicted_p95_ms / budget_ms.max(1) as f64;
    let (status, explanation) = if ratio <= 0.70 {
        (
            "comfortable",
            "Predicted p95 uses at most 70% of the startup budget.",
        )
    } else if ratio <= 1.0 {
        (
            "watch",
            "Predicted p95 is inside the budget with less than 30% headroom.",
        )
    } else {
        (
            "exceeded",
            "Predicted p95 exceeds the configured startup budget.",
        )
    };
    CapacityEnvelope {
        status: status.into(),
        startup_budget_ms: budget_ms,
        predicted_p95_ms: round1(predicted_p95_ms),
        headroom_ms: round1(budget_ms as f64 - predicted_p95_ms),
        explanation: explanation.into(),
    }
}

pub fn compare_reports(predicted: &Report, observed: &Report) -> Comparison {
    let prediction = predicted.model.predicted_p95_ms;
    let observed_p95 = observed
        .levels
        .last()
        .map(|level| level.p95_ms)
        .unwrap_or(0.0);
    let error = if observed_p95 > 0.0 {
        ((prediction - observed_p95).abs() / observed_p95) * 100.0
    } else {
        100.0
    };
    Comparison {
        predicted_p95_ms: prediction,
        observed_p95_ms: observed_p95,
        absolute_error_percent: round1(error),
        within_25_percent: error <= 25.0,
        shape_matches: predicted.config.containers == observed.config.containers
            && predicted.config.ports_per_container == observed.config.ports_per_container
            && predicted.config.mounts_per_container == observed.config.mounts_per_container,
    }
}

pub fn round1(value: f64) -> f64 {
    (value * 10.0).round() / 10.0
}

#[cfg(test)]
mod tests {
    use super::*;

    fn observation(level: u16, latency: f64, bindings: u64) -> Observation {
        Observation {
            sample: 1,
            active_containers: level,
            startup_ms: latency,
            published_bindings: bindings,
            host_network_rule_count: None,
        }
    }

    #[test]
    fn percentile_uses_conservative_nearest_rank() {
        assert_eq!(percentile(&[10.0, 20.0, 30.0, 40.0], 0.95), 40.0);
        assert_eq!(percentile(&[], 0.95), 0.0);
    }

    #[test]
    fn summarizes_and_predicts_target() {
        let observations = vec![
            observation(1, 100.0, 2),
            observation(1, 110.0, 2),
            observation(2, 140.0, 4),
            observation(2, 150.0, 4),
        ];
        let levels = summarize_levels(&observations);
        assert_eq!(levels.len(), 2);
        assert_eq!(levels[1].p95_ms, 150.0);
        let model = build_model(&levels, 4);
        assert_eq!(model.predicted_p95_ms, 150.0);
        assert_eq!(capacity_envelope(150.0, 100).status, "exceeded");
    }
}
