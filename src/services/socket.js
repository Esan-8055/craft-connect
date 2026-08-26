/**
 * Simulated Socket.io Client for real-time order status updates.
 * Simulates real-time event propagation across tabs/windows using a unified event channel.
 */
class SocketSimulator {
  constructor() {
    this.listeners = {};
    this.connected = true;

    // Listen to storage events for cross-tab real-time sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'cc_socket_event') {
        try {
          const { eventName, data } = JSON.parse(e.newValue);
          this._trigger(eventName, data);
        } catch (err) {
          console.warn('[Socket.io] Failed to parse socket event:', err);
        }
      }
    });

    // Listen to local custom events for same-tab real-time sync
    window.addEventListener('cc_socket_local_event', (e) => {
      const { eventName, data } = e.detail || {};
      if (eventName) {
        this._trigger(eventName, data);
      }
    });

    console.log('[Socket.io] Connected to namespace: /orders (Real-time active)');
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    console.log(`[Socket.io] Registered listener for event: "${eventName}"`);
  }

  off(eventName, callback) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
  }

  emit(eventName, data) {
    console.log(`[Socket.io] Emitting event: "${eventName}"`, data);

    const payload = { eventName, data, _ts: Date.now() };
    const payloadStr = JSON.stringify(payload);

    // Broadcast to other tabs
    localStorage.setItem('cc_socket_event', payloadStr);
    // Reset key so same event can be fired again
    localStorage.removeItem('cc_socket_event');

    // Broadcast to current tab
    window.dispatchEvent(new CustomEvent('cc_socket_local_event', { detail: payload }));
  }

  _trigger(eventName, data) {
    console.log(`[Socket.io] Received event: "${eventName}"`, data);
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }
}

export const socket = new SocketSimulator();
export default socket;
