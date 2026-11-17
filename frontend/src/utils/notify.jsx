const TOAST_ID = "custom-global-toast";
let hideTimer = null;

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "!",
  loading: "⟳",
};

const COLORS = {
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  loading: "#2563eb",
};

const ensureStyle = () => {
  if (document.getElementById("custom-toast-style")) return;

  const style = document.createElement("style");
  style.id = "custom-toast-style";
  style.innerHTML = `
    #${TOAST_ID} {
      position: fixed;
      top: 1vh;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      background: #032239;
      color: #fff;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      min-width: 260px;
      max-width: 520px;
      animation: toastFadeIn 0.2s ease;
    }

    #${TOAST_ID} .toast-icon {
      width: 22px;
      height: 22px;
      min-width: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
    }

    #${TOAST_ID} .toast-loading {
      animation: toastSpin 0.9s linear infinite;
    }

    @keyframes toastFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -8px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }

    @keyframes toastSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
};

const showToast = (type, msg, duration = 6000) => {
  ensureStyle();

  clearTimeout(hideTimer);

  let toast = document.getElementById(TOAST_ID);

  if (!toast) {
    toast = document.createElement("div");
    toast.id = TOAST_ID;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span 
      class="toast-icon ${type === "loading" ? "toast-loading" : ""}" 
      style="background:${COLORS[type]}"
    >
      ${ICONS[type]}
    </span>
    <span>${msg}</span>
  `;

  if (duration > 0) {
    hideTimer = setTimeout(() => {
      notify.destroy();
    }, duration);
  }
};

// Store active toast key to support updating
let activeKey = null;

export const notify = {
  success: (msg) => {
    showToast("success", msg, 6000);
    activeKey = null;
  },

  error: (msg) => {
    showToast("error", msg || "Something went wrong", 6000);
    activeKey = null;
  },

  warning: (msg) => {
    showToast("warning", msg || "Something went wrong", 6000);
    activeKey = null;
  },

  loading: (msg = "Processing...") => {
    showToast("loading", msg, 0);
    activeKey = null;
  },

  destroy: () => {
    clearTimeout(hideTimer);
    const toast = document.getElementById(TOAST_ID);
    if (toast) toast.remove();
    activeKey = null;
  },

  // NEW: open method to match Ant Design's API
  open: (config) => {
    const { key, type, content, duration } = config;
    
    // If it's a loading toast or a new toast with same key as loading, keep it
    if (type === "loading") {
      if (activeKey === key) {
        // Update existing loading toast
        const toast = document.getElementById(TOAST_ID);
        if (toast) {
          const iconSpan = toast.querySelector(".toast-icon");
          const msgSpan = toast.querySelector("span:last-child");
          if (iconSpan) {
            iconSpan.className = `toast-icon toast-loading`;
            iconSpan.style.background = COLORS.loading;
            iconSpan.innerHTML = ICONS.loading;
          }
          if (msgSpan) msgSpan.innerHTML = content;
        }
      } else {
        // New loading toast
        activeKey = key;
        showToast("loading", content, duration || 0);
      }
    } else if (type === "success") {
      activeKey = null;
      showToast("success", content, duration || 3000);
    } else if (type === "error") {
      activeKey = null;
      showToast("error", content, duration || 6000);
    } else if (type === "warning") {
      activeKey = null;
      showToast("warning", content, duration || 6000);
    }
  },
};