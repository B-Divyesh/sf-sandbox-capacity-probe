# Demo sandbox

Open `/?demo=1#cli-demo` or choose **Try it with sample data** on the first
screen. The site first shows a self-hosted recording of `capacity-probe demo`.
Its output comes from the shipped `cli/examples/demo-capacity.json` report.

The same page loads a 24-container planning scenario with four ports and two
mounts per container. It works without an account or requests beyond the site.

The persistent **Demo — sample data, nothing is saved** banner offers **Reset
demo** and **Exit demo and use your data**. Demo changes are stored only under the local
storage key `demo:sandbox-capacity-probe:scenario`; normal license and saved
scenario keys are never read or written in demo mode. Leaving demo removes that
key. Purchase links and license restore controls stay unavailable until you
choose **Exit demo and use your data**, so the demo never contacts billing.

For the CLI, run `capacity-probe demo` or `capacity-probe --demo`. It writes the
bundled report to a process-specific temporary directory and prints its path.
It never contacts Docker, Podman, or a network service. The same report is
available on the site at `/demo-capacity.json`.
