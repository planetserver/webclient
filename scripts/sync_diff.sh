#!/bin/bash  

function bulkGitDiff() {
	REMOTE_MACHINE=""
	REMOTE_DIR=""
	OPTION=""
	for REMOTE_INFO in "$@"
	do
		if [ -n "$REMOTE_MACHINE" ]
		then REMOTE_DIR="$REMOTE_INFO"
			echo "Processing dir $REMOTE_DIR on client $REMOTE_MACHINE"
			ssh "$REMOTE_MACHINE" "bash -s" < "diff.sh" "$REMOTE_DIR"
			REMOTE_MACHINE=""
		else REMOTE_MACHINE="$REMOTE_INFO"
		fi		
	done
}

bulkGitDiff "$@"
