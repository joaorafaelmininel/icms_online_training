'use client'
alert('You must accept Terms and Privacy Policy')
return
}


const { data, error } = await supabase.auth.signUp({
email: form.email,
password: form.password,
options: {
data: {
username: form.username,
first_name: form.first_name,
middle_name: form.middle_name || null,
last_name: form.last_name,
country: form.country,
title: form.title,
preferred_language: form.preferred_language,
},
},
})


if (error) alert(error.message)
}


return (
<div className="auth-card">
<div className="tabs">
<button className={tab === 'signin' ? 'active' : ''} onClick={() => setTab('signin')}>
Sign In
</button>
<button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>
Sign Up
</button>
</div>


{tab === 'signin' && (
<>
<h2>Sign in to your account</h2>
<input name="email" placeholder="Email" onChange={update} />
<input name="password" type="password" placeholder="Password" onChange={update} />
<button className="primary" onClick={signIn}>Sign In</button>
</>
)}


{tab === 'signup' && (
<>
<h2>Create your account</h2>


<input name="email" placeholder="Email" onChange={update} />
<input name="password" type="password" placeholder="Password" onChange={update} />


<select name="title" onChange={update}>
<option value="mr">Mr</option>
<option value="mrs">Mrs</option>
<option value="ms">Ms</option>
</select>


<input name="first_name" placeholder="First name" onChange={update} />
<input name="middle_name" placeholder="Middle name (optional)" onChange={update} />
<input name="last_name" placeholder="Last name" onChange={update} />


<input name="username" placeholder="Username (lowercase)" onChange={update} />
<input name="country" placeholder="Country" onChange={update} />


<select name="preferred_language" onChange={update}>
<option value="en">English</option>
<option value="es">Español</option>
</select>


<label>
<input type="checkbox" name="terms" onChange={update} /> I accept the Terms of Use
</label>
<label>
<input type="checkbox" name="privacy" onChange={update} /> I accept the Privacy Policy
</label>


<button className="primary" onClick={signUp}>Create account</button>
</>
)}
</div>
)
}