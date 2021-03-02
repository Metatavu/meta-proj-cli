#!/bin/bash
while [ -n "$1" "$ACCESS" "$SECRET" ]; do # while loop starts
    case "$1" in

      -"$1")
      # cd
      if grep -Fxq "[$1]" ~/.aws/credentials; then
        echo "Found "$1" configuration. Not writing a new one."
        export AWS_PROFILE="$1"
      else
        echo "Writing "$1" configuration..."
        configOutput=`\n[$1]\nregion = us-east-2\noutput = yaml` >> ~/.aws/config
        echo configOutput
        credsOutput=`\n[$1]\naws_access_key_id = $ACCESS\naws_secret_access_key = $SECRET` >> ~/.aws/credentials
        echo credsOutput
        export AWS_PROFILE="$1"
      fi
      echo "Congiguring as $1"
      ;;

    esac
    shift
done
