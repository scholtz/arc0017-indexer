if [ "$ver" == "" ]; then
ver=1.0.0
fi

echo "docker build -t \"scholtz2/arc0017-indexer:$ver-stable\" -f compose ../"

#echo "{\"v\":\"$ver\"}" > "../soldier/version.json"

#echo "version.json:"
#cat ../soldier/version.json

docker build -t "scholtz2/arc0017-indexer:$ver-stable" -f compose  ../ || error_code=$?
if [ "$error_code" != "" ]; then
echo "$error_code";
    echo "failed to build";
	exit 1;
fi

docker push "scholtz2/arc0017-indexer:$ver-stable"  || error_code=$?

if [ "$error_code" != "" ]; then
echo "$error_code";
    echo "failed to push";
	exit 1;
fi

echo "Image: scholtz2/arc0017-indexer:$ver-stable"
