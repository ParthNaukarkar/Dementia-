// Cross-Portal Synchronization Relay
// Bridges events between Patient Portal and Caregiver Portal

export type PortalSyncEventType =
  | 'SESSION_COMPLETED'
  | 'MEDICATION_MUTATED'
  | 'ROUTINE_MUTATED'
  | 'PRESCRIPTION_MUTATED'
  | 'REPORTS_MUTATED'
  | 'LANGUAGE_CHANGED'
  | 'PATIENT_SOS_ALERT'
  | 'SOS_ALERTS_MUTATED';

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
  private targetOrigin: string = '';
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
    window.addEventListener('smriti_sos_alerts_updated', () => {
      this.broadcast('SOS_ALERTS_MUTATED', { updated: true });
    });
  }

  private isAllowedOrigin(origin: string): boolean {
    if (typeof window === 'undefined' || !origin) return false;
    try {
      const url = new URL(origin);
      if (url.hostname !== window.location.hostname || url.protocol !== window.location.protocol) {
        return false;
      }
      const allowedPorts = new Set(['5173', '5174']);
      if (window.location.port) allowedPorts.add(window.location.port);
      if (!url.port && !window.location.port) return true;
      return allowedPorts.has(url.port);
    } catch {
      return false;
    }
  }

  private initPostMessageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event: MessageEvent) => {
      if (!this.isAllowedOrigin(event.origin)) {
        return;
      }
      if (event.data && typeof event.data === 'object' && event.data.isSmritiSyncMessage) {
        const message = event.data.syncMessage as PortalSyncMessage;
        if (message) {
          this.notifyListeners(message);
        }
      }
    });
  }

  /**
   * Set up an invisible cross-origin iframe bridge to mirror data between port 5173 & 5174 in multi-port dev mode.
   * In single-origin / production mode, this is safely skipped as BroadcastChannel & storage events handle native sync.
   */
  public setupCrossPortBridge(targetPort: number) {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    const currentPort = window.location.port ? parseInt(window.location.port, 10) : (window.location.protocol === 'https:' ? 443 : 80);
    const isDevHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Only mount iframe bridge if running locally on two different dev ports
    if (!isDevHost || !window.location.port || currentPort === targetPort) {
      return;
    }

    this.targetOrigin = `${window.location.protocol}//${window.location.hostname}:${targetPort}`;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${this.targetOrigin}/storage_bridge.html`;
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

    // 1. BroadcastChannel (fast, same-origin cross-tab)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {}
    }

    // 2. Storage event trigger (same port / same origin cross-tab)
    try {
      const syncKey = `smriti_sync_signal_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem(syncKey, JSON.stringify(message));
      localStorage.setItem('smriti_sync_signal_latest', JSON.stringify(message));
      setTimeout(() => {
        try { localStorage.removeItem(syncKey); } catch {}
      }, 15000);
    } catch {}

    // 3. Cross-port postMessage to bridge iframe (dev multi-port only, with explicit targetOrigin)
    if (this.iframeBridge && this.iframeBridge.contentWindow && this.targetOrigin) {
      try {
        this.iframeBridge.contentWindow.postMessage(
          { isSmritiSyncMessage: true, syncMessage: message },
          this.targetOrigin
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
