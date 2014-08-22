#!/bin/bash  

# This script can be used to perform a diff on a 
# local folder and a folder that is on github

# $1 is the folder that we want to compare with the repo
# $2 is the parent of $1
# $3 is the name of the repo
# $4 is the url for the repo

function usage() {
	echo "usage : bash diff.sh <local-folder> <parent-folder-name> <repo-name> <repo-url>"
}

function localDiff() {
	if [ "$4" = "" ]
	then usage
		exit 1
	fi
	cd "$2"
	mkdir "tmp"
	cd "tmp"
	git clone "$4"
	IS_UP_TO_DATE=$(diff "../$1" "$3" 2>&1)
	if [ -n "$IS_UP_TO_DATE" ]
	then echo "The metadata is NOT upto date" 
		echo "$IS_UP_TO_DATE"
	else echo "The metadata is up to date"
	fi	
	rm -rf "../tmp"
}

localDiff "$1" "$2" "$3" "$4" 
