#!/bin/bash  


function singleGitDiff() {
	cd "$1"
	RES=$(git diff 2>&1)
	if [ -n "$RES" ]
	then echo "Something went WRONG" 
		echo "$RES"
	else echo "$The client repo is UPDATED"
	fi	
}

singleGitDiff "$1"