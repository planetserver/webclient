#!/bin/bash  


function singleGitUpdate() {
	cd "$1"
	RES=$(git pull 2>&1)
	echo "GIT RESPONSE : "
	echo "$RES"
}

singleGitUpdate "$1"