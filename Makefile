all:
	rm ../bitstamp-xrp-price.zip || true
	zip -r ../bitstamp-xrp-price.zip ./*
