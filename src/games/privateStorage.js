// CalmPop - Secure & Isolated Private Reflections Storage
// Manages employee-private thoughts, CBT logs, worry balloons, paper cranes,
// weather reports, and artwork. NEVER exposes content to analytics or HR reports.

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_session_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class PrivateStorageManager {
  static getStorageKey(itemType) {
    const empId = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_employee_id') : null) || 'local_user';
    return `calmpop_private_${empId}_${itemType || 'all'}`;
  }

  // Save private item
  static async savePrivateItem(itemType, content) {
    const empId = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_employee_id') : null) || 'local_user';
    const id = `PRIV-${itemType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const item = {
      id,
      itemType,
      content,
      createdAt: now,
      updatedAt: now
    };

    // 1. Save to employee-isolated local storage
    if (typeof localStorage !== 'undefined') {
      try {
        const key = this.getStorageKey(itemType);
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift(item);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.warn('Local storage write issue:', e);
      }
    }

    // 2. Sync to secure authenticated server endpoint if logged in
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_session_token') : null;
    if (token) {
      try {
        await fetch('/api/employee/private-items', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id,
            itemType,
            content
          })
        });
      } catch (err) {
        // Fallback safely saved in local storage
      }
    }

    return item;
  }

  // Retrieve private items for current employee
  static async getPrivateItems(itemType = null) {
    const empId = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_employee_id') : null) || 'local_user';
    let localItems = [];

    if (typeof localStorage !== 'undefined') {
      try {
        if (itemType) {
          const key = this.getStorageKey(itemType);
          localItems = JSON.parse(localStorage.getItem(key) || '[]');
        } else {
          // Aggregate all types
          const types = ['thought_reframer', 'weather_report', 'paper_crane', 'worry_balloon', 'inkstorm_art'];
          for (const t of types) {
            const key = this.getStorageKey(t);
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            localItems.push(...list);
          }
        }
      } catch {}
    }

    // Attempt to pull latest from server if online and authenticated
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_session_token') : null;
    if (token) {
      try {
        const url = itemType 
          ? `/api/employee/private-items?itemType=${encodeURIComponent(itemType)}`
          : '/api/employee/private-items';
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            // Merge deduplicated by ID
            const serverMap = new Map(data.items.map(i => [i.id, i]));
            for (const loc of localItems) {
              if (!serverMap.has(loc.id)) {
                serverMap.set(loc.id, loc);
              }
            }
            return Array.from(serverMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }
        }
      } catch {}
    }

    return localItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Delete private item permanently
  static async deletePrivateItem(id, itemType = null) {
    // 1. Remove from local storage
    if (typeof localStorage !== 'undefined') {
      try {
        const types = itemType ? [itemType] : ['thought_reframer', 'weather_report', 'paper_crane', 'worry_balloon', 'inkstorm_art'];
        for (const t of types) {
          const key = this.getStorageKey(t);
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = existing.filter(i => i.id !== id);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {}
    }

    // 2. Remove from server
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('calmpop_session_token') : null;
    if (token) {
      try {
        await fetch(`/api/employee/private-items/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch {}
    }

    return true;
  }
}

