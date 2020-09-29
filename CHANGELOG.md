# 2.0.3
* Added "slow log" debug message for services that takes longer than 10s to create.

# 2.0.2
* Added debug messages via `debug` package

# 2.0.1
* Added missing implementation of `reference.type`

# 2.0.0
* Autowiring!
* Definition does not require name anymore. If name is not provided then gets randomly generated.
* added `createAnnotationFactory` helper