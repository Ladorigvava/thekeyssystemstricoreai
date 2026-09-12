# TKS and NVIDIA AI Workbench

## Public relationship statement

> **TKS works with NVIDIA AI Workbench in selected AI and media engineering workflows.** TKS uses AI Workbench as a reproducible, Git-centered development environment for local or remote project work.

NVIDIA is identified here as the provider of a development tool used by TKS. TKS is independently developed. This statement does not claim NVIDIA sponsorship, endorsement, partnership, certification, or corporate affiliation.

The NVIDIA name is used as plain text. Do not add the NVIDIA logo or imitate NVIDIA's trade dress without written authorization.

## What "works with" means

For this project, the phrase has a narrow technical meaning:

- the TKS source remains versioned in Git;
- NVIDIA AI Workbench can import the repository and create a project environment;
- the project can be developed and tested in a container managed by AI Workbench;
- the environment may run on a local workstation or a connected remote system;
- provider credentials must be supplied as runtime secrets and must never be committed.

AI Workbench is a development environment. It is not the DNS registrar or production host for the public TKS domains.

## Workbench setup

NVIDIA recommends importing an existing Git repository and allowing AI Workbench to scaffold the initial project specification when the repository does not yet contain a valid `.project/spec.yaml`.

1. In NVIDIA AI Workbench, create a project from this repository:
   `https://github.com/Ladorigvava/thekeyssystemstricoreai`
2. Select a supported base environment.
3. Let AI Workbench generate the initial project specification.
4. In the project terminal, install dependencies with `npm install`.
5. Add a custom web application in AI Workbench with:
   - start command: `npm run dev -- --host 0.0.0.0`
   - port: `5000`
6. Start the application through AI Workbench and verify its proxied session URL.
7. Run `npm run build` before accepting changes.
8. Store any provider keys in the project runtime secret store. Do not expose secrets through browser-delivered `VITE_*` variables.

The generated project specification must be tested in AI Workbench before it is committed. A Workbench session URL is temporary and is not a replacement for the production website.

## Verification checklist

A TKS change may be described as tested through NVIDIA AI Workbench only after all applicable checks pass:

- the repository clones successfully;
- the Workbench environment builds;
- the custom web application starts on port 5000;
- the proxied interface loads;
- `npm run build` completes;
- no credential is committed or delivered to the browser;
- the public deployment is tested separately on its actual host.

## Path to a formal NVIDIA relationship

A formal relationship requires separate acceptance by NVIDIA. If TKS meets the eligibility criteria, the appropriate next step is an application to [NVIDIA Inception](https://www.nvidia.com/en-us/startups/).

Until NVIDIA confirms acceptance in writing, public materials must use the technical statement above and must not call TKS an NVIDIA partner, NVIDIA Inception member, NVIDIA-certified product, or NVIDIA-sponsored company.

## Official references

- [NVIDIA AI Workbench introduction](https://docs.nvidia.com/ai-workbench/user-guide/latest/overview/introduction.html)
- [Work with any Git repository](https://docs.nvidia.com/ai-workbench/user-guide/latest/how-to/convert-repo.html)
- [AI Workbench applications](https://docs.nvidia.com/ai-workbench/user-guide/latest/concepts/application-concept.html)
- [NVIDIA brand usage guidelines](https://www.nvidia.com/en-us/about-nvidia/legal-info/logo-brand-usage/)
