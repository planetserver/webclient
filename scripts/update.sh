#!/bin/bash  

# $1 is the name of the folder that we wish to update
# $2 is the url of the repo that will be used
# $3 is the name of the repo that is located at $2

function singleFolderUpdate() {
	rm -rf "$1"
	GIT_RESULT = $(git clone "$2" 2>&1)
	mv "$3" "$1"
	echo "$GIT_RESULT"
}

singleFolderUpdate "$@"
