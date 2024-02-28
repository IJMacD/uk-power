#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

if [ -n "$(git status --porcelain)" ]; then
  echo "Please ensure there are no changes or untracked files before rebuilding"
  exit 1
fi

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source ${SCRIPT_DIR}/vars.sh

echo "Deploying version $GIT_TAG"

# Override
export KUBECONFIG=~/.kube/config.prod

docker push ${REGISTRY_NAME}/${REPO}/${APPNAME}:${GIT_TAG}

helm upgrade --install ${APPNAME} \
  $SCRIPT_DIR/kube/chart/${APPNAME}/ \
  --namespace ${APPNAME} --create-namespace \
  --set appVersion=${GIT_TAG} \
  $@

