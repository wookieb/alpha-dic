# 3.0.0
* "slow log" does not report on failed service creation
* Added `TransformArg`
* Added `ResolveArg`
* `ConfigRequest` now becomes `ConfigRequestArg`
* Upgrade to typescript 3.9
* Package is now exported as es2018
* Added `andPredicate` for annotation factory
* Added `owner` property to all definitions once they get registered in container #11
* Added ability to alias definitions between and within the same container #15

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