/**
 * A simple event emitter implementation that works in the browser
 * without requiring Node.js's events module
 */
export class BrowserEventEmitter {
    private events: Record<string, ((...args: any[]) => void)[]> = {};

    /**
     * Register an event listener
     * @param event The event name to listen for
     * @param callback The function to call when the event is emitted
     * @returns The callback function for easy removal
     */
    on(event: string, callback: (...args: any[]) => void): (...args: any[]) => void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return callback;
    }

    /**
     * Emit an event with optional arguments
     * @param event The event name to emit
     * @param args Arguments to pass to listeners
     */
    emit(event: string, ...args: any[]): void {
        const callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${ event }:`, error);
                }
            });
        }
    }

    /**
     * Remove an event listener
     * @param event The event name
     * @param callback The callback to remove
     */
    off(event: string, callback: (...args: any[]) => void): void {
        if (!this.events[event]) return;

        const index = this.events[event].indexOf(callback);
        if (index !== -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * Remove all listeners for a specific event
     * @param event The event name
     */
    removeAllListeners(event?: string): void {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}