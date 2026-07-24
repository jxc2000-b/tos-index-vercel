# Kubernetes project
Inside: 
- Enterprise level dev process
- Tech used: 
<div align="center">
[![Used](https://skillicons.dev/icons?i=ts,react,nextjs,tailwind,postgres,pnpm,kubernetes,docker,prisma)](https://skillicons.dev)
</div>

- Debugging practice
- stages, minikube and Kubernetes
- monolith file structure 
- Other Antics

## To run:

export your config file into KUBECONFIG
```
export KUBECONFIG=~/.kube/<your-config>.kubeconfig
```

verify with: 
```
kubectl auth whoami
```
Replace all ```namespace``` attributes with your authorized namespace

create your own postgres sever, run either locally or in the cluster

set ```DATABASE_URL``` to your server's URL in your ```.env``` file
```
DATABASE_URL=postgresql://appuser:<your-password>@postgres:5432/appdb
```

notice how all the other variables are default, ```appuser```, port as 5432, and ```appdb```. This is necessary for the app to function 

To use makefile, load your ```.env``` into the shell with:

```
set -a 
source .env 
set +a
```
Then for example run
```
make push-image TAG=latest
```

> if you are on a windows computer your docker command will be different

now install deps with: 
```
pnpm install
```

run ```prisma generate``` and ```prisma help``` because you will probably need it


To be continued...

## To use: 

coming soon... 

*god bless makefile*