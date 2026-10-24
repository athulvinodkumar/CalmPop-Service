// CalmPop - Real Employee Login View
// Implements real server-side authentication with session management,
// password verification, rate-limiting feedback, and company tenant validation.

let loginState = {
  isLoading: false,
  errorMessage: '',
  fieldErrors: {}
};

export function renderEmployeeLoginView(containerId = 'app-view-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-screen bg-background flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      
      <!-- Top Brand Header -->
      <div class="max-w-md w-full mx-auto flex items-center justify-between mb-8">
        <a href="#home" onclick="window.navigateView('landing')" class="flex items-center gap-3 group">
          <img alt="CalmPop Logo" class="h-8 w-auto object-contain transition-transform group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/AEtjO1WGEh00kXjxC-nRTncmjpGib0cLyCbt9ALqLbrBhfdig6r5L9wi5sgO3MFI_wd_iXaIRyJFIkstCjbWXKwffm7ECqDcLAgv5Kcx0KpXhprJ8ki9DKEbQHcSDfDUDG0RctReHBwPpK-6UbUizp5IS9wtVcYr8HNxHH54u-v3orL0pZ037sUoCqRDo4S_OsT7sylMzGbyHL6ETa-ofrjs0QX37bw6xNCP8HNV9iAL4K1meefYhcZo474dido-"/>
          <span class="font-headline-sm text-xl font-bold text-on-surface">CalmPop</span>
        </a>

        <a href="#home" onclick="window.navigateView('landing')" class="text-xs text-outline hover:text-on-surface transition-colors flex items-center gap-1 font-medium">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </a>
      </div>

      <!-- Main Login Card Container -->
      <div class="max-w-md w-full mx-auto bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container shadow-xl space-y-6">
        
        <!-- Header & Title -->
        <div class="text-center space-y-1.5">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span class="material-symbols-outlined text-[26px]">badge</span>
          </div>
          <h2 class="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Welcome back
          </h2>
          <p class="text-xs sm:text-sm text-on-surface-variant">
            Sign in to complete your weekly check-in.
          </p>
        </div>

        <!-- Server Authentication Error Alert -->
        <div id="login-server-error" class="hidden p-4 rounded-2xl bg-error-container/40 border border-error/30 text-xs text-error flex items-start gap-3">
          <span class="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">error</span>
          <div class="flex-1 leading-relaxed">
            <p class="font-bold" id="login-server-error-title">Authentication Failed</p>
            <p id="login-server-error-text" class="text-[11px] mt-0.5"></p>
          </div>
        </div>

        <!-- Login Form -->
        <form id="employee-login-form" onsubmit="window.handleEmployeeLogin(event)" novalidate class="space-y-4">
          
          <!-- Company ID Field -->
          <div>
            <label for="login-company-id" class="block text-xs font-semibold text-on-surface mb-1.5">
              Company ID <span class="text-error">*</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">domain</span>
              <input 
                type="text" 
                id="login-company-id" 
                name="companyId" 
                placeholder="e.g. CP-ORG-78214" 
                required
                autocomplete="organization"
                class="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface uppercase font-mono font-medium"
              />
            </div>
            <p id="login-err-company-id" class="text-error text-[11px] mt-1 hidden font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">error</span>
              <span class="err-text">Company ID is required.</span>
            </p>
          </div>

          <!-- Username Field -->
          <div>
            <label for="login-username" class="block text-xs font-semibold text-on-surface mb-1.5">
              Username <span class="text-error">*</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">person</span>
              <input 
                type="text" 
                id="login-username" 
                name="username" 
                placeholder="e.g. aaravpatel" 
                required
                autocomplete="username"
                class="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface font-mono"
              />
            </div>
            <p id="login-err-username" class="text-error text-[11px] mt-1 hidden font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">error</span>
              <span class="err-text">Username is required.</span>
            </p>
          </div>

          <!-- Password Field with Show/Hide Toggle -->
          <div>
            <label for="login-password" class="block text-xs font-semibold text-on-surface mb-1.5">
              Password <span class="text-error">*</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
              <input 
                type="password" 
                id="login-password" 
                name="password" 
                placeholder="Enter your password" 
                required
                autocomplete="current-password"
                class="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-white focus:outline-none transition-all text-on-surface"
              />
              <button 
                type="button" 
                id="login-password-toggle"
                onclick="window.toggleLoginPasswordVisibility()" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors"
                aria-label="Toggle password visibility"
              >
                <span id="login-password-icon" class="material-symbols-outlined text-[18px]">visibility</span>
              </button>
            </div>
            <p id="login-err-password" class="text-error text-[11px] mt-1 hidden font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">error</span>
              <span class="err-text">Password is required.</span>
            </p>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="login-remember-me" 
                class="w-4 h-4 rounded text-primary focus:ring-primary border-surface-container-high bg-surface-container-low cursor-pointer" 
              />
              <span class="text-xs text-on-surface-variant font-medium">Remember me for 30 days</span>
            </label>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button 
              type="submit" 
              id="login-submit-btn"
              class="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span id="login-submit-text">Sign In</span>
              <span id="login-submit-spinner" class="hidden material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            </button>
          </div>

        </form>

        <!-- Development / Test Accounts Helper -->
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container text-xs space-y-2">
          <div class="flex items-center justify-between text-outline">
            <span class="font-semibold text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-tertiary">key</span>
              <span>Test Accounts (Real Server Database)</span>
            </span>
            <span class="text-[10px] bg-tertiary-fixed text-on-tertiary-fixed font-bold px-2 py-0.5 rounded-full">Dev Mode</span>
          </div>
          
          <div class="space-y-1.5 text-[11px] text-on-surface-variant">
            <div class="p-2 bg-surface-container-lowest rounded-xl flex items-center justify-between border border-surface-container/60">
              <div>
                <p class="font-bold text-on-surface">Strata Labs (CP-ORG-78214)</p>
                <p class="font-mono text-[10px] text-outline">User: <code class="text-primary font-bold">aaravpatel</code> • Pass: <code class="text-primary">CalmPop@2026!</code></p>
              </div>
              <button type="button" onclick="window.autoFillLogin('CP-ORG-78214', 'aaravpatel', 'CalmPop@2026!')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] transition-colors">
                Fill
              </button>
            </div>

            <div class="p-2 bg-surface-container-lowest rounded-xl flex items-center justify-between border border-surface-container/60">
              <div>
                <p class="font-bold text-on-surface">Zenith Global (CP-ORG-99001)</p>
                <p class="font-mono text-[10px] text-outline">User: <code class="text-primary font-bold">aaravpatel</code> • Pass: <code class="text-primary">Zenith@2026!</code></p>
              </div>
              <button type="button" onclick="window.autoFillLogin('CP-ORG-99001', 'aaravpatel', 'Zenith@2026!')" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] transition-colors">
                Fill
              </button>
            </div>
          </div>

          <p class="text-[10px] text-outline leading-tight pt-1">
            * Note: Credentials are cryptographically verified using scrypt on the server. Cross-company logins are strictly blocked.
          </p>
        </div>

        <!-- Demonstration Notice & Admin Portal Switcher -->
        <div class="pt-2 text-center text-xs text-outline space-y-1">
          <p>Looking for the HR Administrator or Superadmin portals?</p>
          <div class="flex items-center justify-center gap-2 pt-1 font-semibold text-primary">
            <button type="button" onclick="window.navigateView('admin')" class="hover:underline">HR Admin Mockup</button>
            <span>•</span>
            <button type="button" onclick="window.navigateView('superadmin')" class="hover:underline">Superadmin Mockup</button>
          </div>
        </div>

      </div>

      <!-- Footer Note -->
      <div class="text-center text-xs text-outline pt-6">
        <span>Protected by enterprise 256-bit scrypt hashing and secure server sessions.</span>
      </div>

    </div>
  `;
}

// Window Event Handlers
window.toggleLoginPasswordVisibility = function() {
  const passInput = document.getElementById('login-password');
  const icon = document.getElementById('login-password-icon');
  if (!passInput || !icon) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    passInput.type = 'password';
    icon.textContent = 'visibility';
  }
};

window.autoFillLogin = function(companyId, username, password) {
  const compElem = document.getElementById('login-company-id');
  const userElem = document.getElementById('login-username');
  const passElem = document.getElementById('login-password');

  if (compElem) compElem.value = companyId;
  if (userElem) userElem.value = username;
  if (passElem) passElem.value = password;

  window.clearLoginFormErrors();
};

window.clearLoginFormErrors = function() {
  const errServer = document.getElementById('login-server-error');
  const errComp = document.getElementById('login-err-company-id');
  const errUser = document.getElementById('login-err-username');
  const errPass = document.getElementById('login-err-password');

  if (errServer) errServer.classList.add('hidden');
  if (errComp) errComp.classList.add('hidden');
  if (errUser) errUser.classList.add('hidden');
  if (errPass) errPass.classList.add('hidden');
};

window.handleEmployeeLogin = async function(e) {
  if (e && e.preventDefault) e.preventDefault();

  window.clearLoginFormErrors();

  const companyId = (document.getElementById('login-company-id')?.value || '').trim();
  const username = (document.getElementById('login-username')?.value || '').trim();
  const password = document.getElementById('login-password')?.value || '';
  const rememberMe = Boolean(document.getElementById('login-remember-me')?.checked);

  let hasError = false;

  if (!companyId) {
    const err = document.getElementById('login-err-company-id');
    if (err) err.classList.remove('hidden');
    hasError = true;
  }
  if (!username) {
    const err = document.getElementById('login-err-username');
    if (err) err.classList.remove('hidden');
    hasError = true;
  }
  if (!password) {
    const err = document.getElementById('login-err-password');
    if (err) err.classList.remove('hidden');
    hasError = true;
  }

  if (hasError) return;

  // Show loading spinner
  const submitBtn = document.getElementById('login-submit-btn');
  const submitText = document.getElementById('login-submit-text');
  const spinner = document.getElementById('login-submit-spinner');

  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.textContent = "Verifying Credentials...";
  if (spinner) spinner.classList.remove('hidden');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        username,
        password,
        rememberMe
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Show server error
      const errBox = document.getElementById('login-server-error');
      const errTitle = document.getElementById('login-server-error-title');
      const errText = document.getElementById('login-server-error-text');

      if (errBox && errText) {
        if (response.status === 429) {
          if (errTitle) errTitle.textContent = "Rate Limit Exceeded";
          errText.textContent = data.error || "Too many failed attempts. Please wait before retrying.";
        } else {
          if (errTitle) errTitle.textContent = "Authentication Failed";
          errText.textContent = data.error || "Invalid Company ID, Username, or Password.";
        }
        errBox.classList.remove('hidden');
      }

      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = "Sign In";
      if (spinner) spinner.classList.add('hidden');
      return;
    }

    // Login successful!
    // Store session token in sessionStorage (fallback for browsers that block 3rd-party cookies)
    if (data.token) {
      sessionStorage.setItem('calmpop_session_token', data.token);
    }
    
    window.showToast(`Welcome back, ${data.employee.name}!`, "verified_user");

    // Redirect to Employee Portal
    setTimeout(() => {
      window.navigateView('employee');
    }, 200);

  } catch (err) {
    console.error('Login error:', err);
    const errBox = document.getElementById('login-server-error');
    const errText = document.getElementById('login-server-error-text');
    if (errBox && errText) {
      errText.textContent = "Unable to connect to CalmPop authentication server. Please verify your connection.";
      errBox.classList.remove('hidden');
    }
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = "Sign In";
    if (spinner) spinner.classList.add('hidden');
  }
};
