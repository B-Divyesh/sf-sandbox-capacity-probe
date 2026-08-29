# Demo sandbox

Open `/?demo=1` or choose **Try it with sample data** on the first screen. The
site opens a realistic 24-container Docker/Podman planning scenario with four
published ports and two mounts per container. The planner is useful immediately
without an account, runtime, or network request beyond the site itself.

The persistent **Demo — sample data, nothing is saved** banner offers **Reset
demo** and **Start for real**. Demo changes are stored only under the local
storage key `demo:sandbox-capacity-probe:scenario`; normal license and saved
scenario keys are never read or written in demo mode. Leaving demo removes that
key.

For the CLI, run either `capacity-probe demo` or `capacity-probe --demo`. It writes the bundled,
realistic sample report to a process-specific temporary directory and prints its
path. It never contacts Docker, Podman, or a network service. The sample source
ships at `cli/examples/demo-capacity.json`.
