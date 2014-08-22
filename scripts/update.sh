#!/bin/bash  

# $1 is the name of the folder that we wish to update
# $2 is the name of the parent folder
# $3 is the name of the repo that is up to date
# $4 is the location of the repo that is up to date

function usage() {
	echo "usage : bash update.sh <folder-name> <parent-folder> <repo-name> <repo-url>"
} 

function localUpdate() {
	if [ "$4" = "" ]
	then usage
		exit 1
	fi
	cd "$2"
	DATE=$(date +"%Y-%m-%d:%H:%M:%S")
	mkdir "backup-$1"
	mkdir "backup-$1/$DATE"
	mv "$1" "backup-$1/$DATE/"
	git clone "$4" 2>&1
	if [ "$3" != "$1" ]
	then mv "$3" "$1"
	fi
}

localUpdate "$1" "$2" "$3" "$4"
