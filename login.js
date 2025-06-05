window.addEventListener("DOMContentLoaded", () => {
  const supabaseUrl = 'https://bmblkqgeaaezttikpxxf.supabase.co'
  const supabaseKey = 'your_anon_key_here'

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

  const emailInput = document.getElementById('email')
  const passwordInput = document.getElementById('password')
  const signupBtn = document.getElementById('signup')
  const loginBtn = document.getElementById('login')
  const logoutBtn = document.getElementById('logout')
  const statusEl = document.getElementById('auth-status')

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      statusEl.textContent = `Signup failed: ${error.message}`
    } else {
      statusEl.textContent = 'Signup successful! Please check your email to confirm.'
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      statusEl.textContent = `Login failed: ${error.message}`
    } else {
      statusEl.textContent = `Logged in as ${email}`
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      statusEl.textContent = `Logout failed: ${error.message}`
    } else {
      statusEl.textContent = `Logged out.`
    }
  }

  signupBtn.addEventListener('click', () => {
    signUp(emailInput.value, passwordInput.value)
  })

  loginBtn.addEventListener('click', () => {
    signIn(emailInput.value, passwordInput.value)
  })

  logoutBtn.addEventListener('click', () => {
    signOut()
  })

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event)

    if (session) {
      logoutBtn.style.display = 'inline-block'
      loginBtn.style.display = 'none'
      signupBtn.style.display = 'none'
      emailInput.disabled = true
      passwordInput.disabled = true
      statusEl.textContent = `Logged in as ${session.user.email}`
    } else {
      logoutBtn.style.display = 'none'
      loginBtn.style.display = 'inline-block'
      signupBtn.style.display = 'inline-block'
      emailInput.disabled = false
      passwordInput.disabled = false
      statusEl.textContent = `Not logged in`
    }
  })

  // Check session on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      logoutBtn.style.display = 'inline-block'
      loginBtn.style.display = 'none'
      signupBtn.style.display = 'none'
      emailInput.disabled = true
      passwordInput.disabled = true
      statusEl.textContent = `Logged in as ${session.user.email}`
    } else {
      statusEl.textContent = `Not logged in`
    }
  })
})
