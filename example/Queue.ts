export class Queue {
    async connect(url: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        })
    }

    applyBackoffStrategy(strategyName: string, config: any) {
        console.log('Applying backoff strategy: ', strategyName, 'and config', config);
    }
}