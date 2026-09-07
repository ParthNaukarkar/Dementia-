// Cross-Portal Synchronization Relay
// Bridges events between Patient Portal (port 5173) and Caregiver Portal (port 5174)

export type PortalSyncEventType =
  | 'SESSION_COMPLETED'
  | 'MEDICATION_MUTATED'
  | 'ROUTINE_MUTATED'
  | 'PRESCRIPTION_MUTATED'
  | 'REPORTS_MUTATED'
  | 'LANGUAGE_CHANGED';

export interface PortalSyncMessage {
  type: PortalSyncEventType;
  payload: any;
  timestamp: number;
  sourcePortal: 'patient' | 'caregiver';
}

type SyncCallback = (message: PortalSyncMessage) => void;

class PortalSyncRelay {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncCallback> = new Set();
  private iframeBridge: HTMLIFrameElement | null = null;
  private isInitialized = false;

  constructor() {
    this.initChannel();
    this.initStorageListener();
    this.initPostMessageListener();
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('smriti_portal_sync_bus');
        this.channel.onmessage = (event: MessageEvent<PortalSyncMessage>) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed:', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key?.startsWith('smriti_sync_signal_')) {
        try {
          if (e.newValue) {
            const data: PortalSyncMessage = JSON.parse(e.newValue);
            this.notifyListeners(data);
          }
        } catch {}
      }
    });

    // Also listen to internal window custom events
    window.addEventListener('smriti_medications_updated', () => {
      this.broadcast('MEDICATION_MUTATED', { updated: true });
    });
    window.addEventListener('smriti_routine_updated', () => {
      this.broadcast('ROUTINE_MUTATED', { updated: true });
    });
    window.addEventListener('smriti_reports_updated', () => {
      this.broadcast('REPORTS_MUTATED', { updated: true });
    });
  }

  private initPostMessageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object' && event.data.isSmritiSyncMessage) {
        const message = event.data.syncMessage as PortalSyncMessage;
        if (message) {
          this.notifyListeners(message);
        }
      }
    });
  }

  /**
   * Set up an invisible cross-origin iframe bridge to mirror data between port 5173 & 5174
   */
  public setupCrossPortBridge(targetPort: number) {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `http://${window.location.hostname}:${targetPort}/storage_bridge.html`;
      iframe.id = 'smriti_cross_port_iframe';
      document.body.appendChild(iframe);
      this.iframeBridge = iframe;
    } catch (err) {
      console.warn('Could not initialize cross-port bridge iframe:', err);
    }
  }

  public broadcast(type: PortalSyncEventType, payload: any, source: 'patient' | 'caregiver' = 'patient') {
    const message: PortalSyncMessage = {
      type,
      payload,
      timestamp: Date.now(),
      sourcePortal: source,
    };

    // 1. BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {}
    }

    // 2. Storage event trigger (same port / same origin cross-tab)
    try {
      localStorage.setItem('smriti_sync_signal_latest', JSON.stringify(message));
    } catch {}

    // 3. Cross-port postMessage to bridge iframe
    if (this.iframeBridge && this.iframeBridge.contentWindow) {
      try {
        this.iframeBridge.contentWindow.postMessage(
          { isSmritiSyncMessage: true, syncMessage: message },
          '*'
        );
      } catch {}
    }

    // Notify local listeners
    this.notifyListeners(message);
  }

  public subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(message: PortalSyncMessage) {
    this.listeners.forEach((cb) => {
      try {
        cb(message);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }
}

export const portalSync = new PortalSyncRelay();
