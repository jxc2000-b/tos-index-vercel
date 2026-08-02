# Bubblewrap troubleshooting

This project may run commands inside a Bubblewrap (`bwrap`) sandbox. A failure such as:

```text
bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted
```

usually means Bubblewrap is installed and starting, but the host, container, or AppArmor policy is blocking a namespace or loopback-network operation. Reinstalling Bubblewrap alone may not fix that specific error.

## 1. Install and verify Bubblewrap on Ubuntu

```bash
sudo apt update
sudo apt install bubblewrap
bwrap --version
command -v bwrap
```

The executable is normally `/usr/bin/bwrap`.

## 2. Check unprivileged user namespaces

```bash
sysctl kernel.unprivileged_userns_clone
```

If the value is `0`, temporarily enable it:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

Treat temporary enablement as a diagnostic because it globally expands unprivileged namespace access. Roll it back with:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=0
```

Only persist `kernel.unprivileged_userns_clone=1` when it agrees with the host security policy.

## 3. Check Ubuntu AppArmor restrictions

Ubuntu may restrict unprivileged user namespaces even when `kernel.unprivileged_userns_clone=1`. The AppArmor sysctl is Ubuntu- and version-dependent, so a missing key is not itself an error.

```bash
sysctl kernel.apparmor_restrict_unprivileged_userns 2>/dev/null || true
sudo aa-status
sudo journalctl -k --since "15 minutes ago" | grep -i -E 'apparmor|denied|bwrap|bubblewrap'
```

If the logs contain an AppArmor denial, prefer adding or correcting a narrowly scoped profile over globally disabling AppArmor protections. Reload profiles after changing them:

```bash
sudo systemctl reload apparmor
```

## 4. Check whether the host permits namespaces

Run these diagnostics from the same user and environment that launches the sandbox:

```bash
unshare --user --map-root-user true
sysctl user.max_user_namespaces
unshare --user --map-root-user --net sh -c 'ip link set lo up && ip addr add 127.0.0.1/8 dev lo && ip addr show lo'
bwrap --unshare-user --unshare-net --ro-bind / / true
grep -E '^(NoNewPrivs|Seccomp|CapEff):' /proc/self/status
```

If the user-only command succeeds but address configuration fails, `RTM_NEWADDR` confirms a failed netlink address operation. The underlying blocker may still be seccomp, AppArmor, container-runtime policy, capabilities, or nested-user-namespace restrictions. A `user.max_user_namespaces` value of `0` also disables new user namespaces.

## 5. Containers and hosted environments

Installing Bubblewrap inside a container does not grant capabilities withheld by its host. Check the container runtime configuration, seccomp profile, AppArmor profile, and user-namespace support. Avoid broadly granting `--privileged`; allow only the namespace operations required by the sandbox.

## 6. Restart the execution environment

After installing Bubblewrap or changing sysctls/AppArmor profiles, fully restart the terminal, container, or Codex execution environment. An already-running environment may retain its previous restrictions.

## 7. Collect useful diagnostics

```bash
bwrap --version
uname -a
cat /etc/os-release
sysctl kernel.unprivileged_userns_clone
sysctl kernel.apparmor_restrict_unprivileged_userns 2>/dev/null || true
sudo journalctl -k --since "15 minutes ago" | grep -i -E 'apparmor|denied|bwrap|bubblewrap'
```

Do not disable AppArmor or grant broad capabilities without reviewing the denial first. The goal is to identify the smallest host-policy change that permits the sandbox.
