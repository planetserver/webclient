#!/bin/bash  

# $1 is the username and the host name to perform the operation
# $2 is the folder that we want to compare with the repo
# $3 is the parent of $1
# $4 is the name of the repo
# $5 is the url for the repo

function usage() {
	echo "usage : bash scp_update <user@host> <folder-name> <parent-folder> <repo-name> <repo-url>"
}

function scpUpdate() {
	if [ "$5" = "" ]
	then usage
		exit 1
	fi
	ssh "$1" "bash -s" < "diff.sh" "$2" "$3" "$4" "$5"
}

scpUpdate "$1" "$2" "$3" "$4" "$5" 


