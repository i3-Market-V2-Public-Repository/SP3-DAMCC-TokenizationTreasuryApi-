#Run with docker

```dockerfile
docker build -t i3-treasury .
docker run -p 3001:3001 -e ETH_HOST='{EthereumChainHost}' -e CONTRACT_ADDRESS='{CONTRACT_ADDRESS}' -e PORT=3001 i3-treasury
```