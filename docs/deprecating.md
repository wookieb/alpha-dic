# Deprecating services
This feature allows to display deprecation note when service marked as deprecated gets created.

```typescript
// via decorator
// will display "Service DeprecatedService is deprecated: Use RedisCache instead" on attempt of
@Deprecated('Use RedisCache instead')  
@Service()
class DeprecatedService {
    
}
```

```typescript
// manually via annotation

container.definitionWithValue('foo', {a: 'service'})
    .annotate(deprecated('Use RedisCache instead'));
```

```typescript
container.get('foo')
// console.warn: Service foo is deprecated: Use RedisCache instead
```