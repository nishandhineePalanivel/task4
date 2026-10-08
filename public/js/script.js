/**
 * Cognifyz Web Development Internship - Level 2, Task 4
 * Task Title: Complex Form Validation and Dynamic DOM Manipulation
 * Description: Modular client-side JavaScript providing real-time form validation,
 *              dynamic DOM manipulation (strength meter, preview, checklist, counters),
 *              and single-page client-side hash routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const registrationForm = document.getElementById('registration-form') || document.querySelector('form.needs-validation');
  
  // Input fields
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const ageInput = document.getElementById('age');
  const courseInput = document.getElementById('course');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const termsCheckbox = document.getElementById('terms');

  // Interactive buttons
  const togglePasswordBtn = document.getElementById('toggle-password');
  const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

  // Character counter
  const nameCharCount = document.getElementById('name-char-count');

  // Password strength meter & checklist
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');
  const reqLength = document.getElementById('req-length');
  const reqUpper = document.getElementById('req-uppercase');
  const reqLower = document.getElementById('req-lowercase');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');

  // Live preview elements
  const previewName = document.getElementById('preview-name');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewCourse = document.getElementById('preview-course');
  const previewStrength = document.getElementById('preview-strength');
  const previewTerms = document.getElementById('preview-terms');

  // Router views & containers
  const mainPortalContent = document.getElementById('main-portal-content');
  const successSection = document.getElementById('success-section');
  const notFoundSection = document.getElementById('not-found-section');
  
  // Success card placeholders
  const successName = document.getElementById('success-name');
  const successDetailName = document.getElementById('success-detail-name');
  const successDetailEmail = document.getElementById('success-detail-email');
  const successDetailPhone = document.getElementById('success-detail-phone');
  const successDetailCourse = document.getElementById('success-detail-course');
  const successDetailAge = document.getElementById('success-detail-age');
  const successTimestamp = document.getElementById('success-timestamp');

  // In-memory state for registration completion
  let isRegistrationComplete = false;
  let submittedUserData = null;

  // --------------------------------------------------------------------------
  // 2. FORM VALIDATION LOGIC & RULES
  // --------------------------------------------------------------------------

  /**
   * Rule A: Name Validation
   * Required, minimum 2 characters, should not contain numbers only.
   */
  function validateName(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Full name is required.' };
    }
    if (trimmed.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long.' };
    }
    if (/^\d+$/.test(trimmed)) {
      return { isValid: false, message: 'Name cannot contain only numbers.' };
    }
    return { isValid: true, message: 'Valid name entered.' };
  }

  /**
   * Rule B: Email Validation
   * Required, valid email pattern.
   */
  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Email address is required.' };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
    }
    return { isValid: true, message: 'Valid email address.' };
  }

  /**
   * Rule C: Phone Validation
   * Required, 10-digit Indian mobile number (digits only, starts with 6-9).
   */
  function validatePhone(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Phone number is required.' };
    }
    if (/[^\d]/.test(trimmed)) {
      return { isValid: false, message: 'Phone number must contain digits only.' };
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' };
    }
    return { isValid: true, message: 'Valid 10-digit phone number.' };
  }

  /**
   * Rule: Age Validation
   * Required, between 16 and 100 years.
   */
  function validateAge(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Age is required.' };
    }
    const ageNum = parseInt(trimmed, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return { isValid: false, message: 'Age must be between 16 and 100.' };
    }
    return { isValid: true, message: 'Valid age.' };
  }

  /**
   * Rule: Course Validation
   * Required selection.
   */
  function validateCourse(value) {
    if (!value || value === '') {
      return { isValid: false, message: 'Please select an engineering course.' };
    }
    return { isValid: true, message: 'Course selected.' };
  }

  /**
   * Rule D: Password Criteria & Strength Evaluator
   * Criteria: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
   */
  function checkPasswordCriteria(password) {
    return {
      hasMinLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  function validatePassword(value) {
    if (!value) {
      return { isValid: false, message: 'Password is required.', score: 0 };
    }
    const criteria = checkPasswordCriteria(value);
    const score = Object.values(criteria).filter(Boolean).length;

    if (!criteria.hasMinLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long.', score, criteria };
    }
    if (!criteria.hasUpper) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).', score, criteria };
    }
    if (!criteria.hasLower) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).', score, criteria };
    }
    if (!criteria.hasNumber) {
      return { isValid: false, message: 'Password must contain at least one number (0-9).', score, criteria };
    }
    if (!criteria.hasSpecial) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*).', score, criteria };
    }

    return { isValid: true, message: 'Strong password meeting all requirements.', score, criteria };
  }

  /**
   * Rule E: Confirm Password Validation
   * Required, must match password.
   */
  function validateConfirmPassword(confirmValue, passwordValue) {
    if (!confirmValue) {
      return { isValid: false, message: 'Please confirm your password.' };
    }
    if (confirmValue !== passwordValue) {
      return { isValid: false, message: 'Passwords do not match.' };
    }
    return { isValid: true, message: 'Passwords match.' };
  }

  /**
   * Rule F: Terms and Conditions Checkbox Validation
   */
  function validateTerms(isChecked) {
    if (!isChecked) {
      return { isValid: false, message: 'You must accept the Terms and Conditions to submit.' };
    }
    return { isValid: true, message: 'Terms accepted.' };
  }

  // --------------------------------------------------------------------------
  // 3. DYNAMIC DOM UPDATES & VISUAL STATE HELPERS
  // --------------------------------------------------------------------------

  /**
   * Updates visual feedback for input fields (is-valid vs is-invalid CSS classes)
   */
  function setFieldState(inputEl, errorElId, validationResult) {
    const errorEl = document.getElementById(errorElId);
    if (!inputEl) return;

    if (validationResult.isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      inputEl.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.textContent = validationResult.message;
        errorEl.className = 'valid-feedback d-block';
      }
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = validationResult.message;
        errorEl.className = 'invalid-feedback d-block';
      }
    }
  }

  /**
   * Resets visual feedback state for an input field
   */
  function clearFieldState(inputEl, errorElId) {
    const errorEl = document.getElementById(errorElId);
    if (inputEl) {
      inputEl.classList.remove('is-valid', 'is-invalid');
      inputEl.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.className = 'invalid-feedback';
    }
  }

  /**
   * Dynamic Name Character Counter
   */
  function updateCharacterCount() {
    if (nameInput && nameCharCount) {
      const currentLength = nameInput.value.length;
      nameCharCount.textContent = `${currentLength} / 50 characters`;
      if (currentLength >= 50) {
        nameCharCount.classList.add('text-danger', 'fw-bold');
      } else {
        nameCharCount.classList.remove('text-danger', 'fw-bold');
      }
    }
  }

  /**
   * Dynamic Password Requirement Checklist Checkmarks
   */
  function updateChecklist(criteria) {
    const updateItem = (elem, passed) => {
      if (!elem) return;
      const icon = elem.querySelector('i');
      if (passed) {
        elem.className = 'text-success fw-semibold d-flex align-items-center gap-1.5 py-0.5';
        if (icon) icon.className = 'bi bi-check-circle-fill text-success';
      } else {
        elem.className = 'text-muted d-flex align-items-center gap-1.5 py-0.5';
        if (icon) icon.className = 'bi bi-circle text-muted';
      }
    };

    updateItem(reqLength, criteria.hasMinLength);
    updateItem(reqUpper, criteria.hasUpper);
    updateItem(reqLower, criteria.hasLower);
    updateItem(reqNumber, criteria.hasNumber);
    updateItem(reqSpecial, criteria.hasSpecial);
  }

  /**
   * Dynamic Password Strength Meter (Bar & Badge)
   */
  function updatePasswordStrengthMeter(value) {
    if (!value || value.length === 0) {
      if (strengthBar) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'progress-bar bg-secondary';
      }
      if (strengthText) {
        strengthText.textContent = 'None';
        strengthText.className = 'badge bg-secondary';
      }
      if (previewStrength) {
        previewStrength.textContent = 'Not set';
        previewStrength.className = 'badge bg-secondary';
      }
      updateChecklist({ hasMinLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false });
      return;
    }

    const criteria = checkPasswordCriteria(value);
    const score = Object.values(criteria).filter(Boolean).length;
    updateChecklist(criteria);

    let strengthLabel = 'Weak';
    let barColorClass = 'bg-danger';
    let badgeColorClass = 'bg-danger';
    let percentage = '33%';

    if (score >= 5) {
      strengthLabel = 'Strong';
      barColorClass = 'bg-success';
      badgeColorClass = 'bg-success';
      percentage = '100%';
    } else if (score >= 3) {
      strengthLabel = 'Medium';
      barColorClass = 'bg-warning';
      badgeColorClass = 'bg-warning text-dark';
      percentage = '66%';
    } else {
      strengthLabel = 'Weak';
      barColorClass = 'bg-danger';
      badgeColorClass = 'bg-danger';
      percentage = '33%';
    }

    if (strengthBar) {
      strengthBar.style.width = percentage;
      strengthBar.className = `progress-bar ${barColorClass}`;
    }
    if (strengthText) {
      strengthText.textContent = strengthLabel;
      strengthText.className = `badge ${badgeColorClass}`;
    }
    if (previewStrength) {
      previewStrength.textContent = strengthLabel;
      previewStrength.className = `badge ${badgeColorClass}`;
    }
  }

  /**
   * Dynamic Registration Live Preview Panel Updates
   * Updates preview values without page refresh using textContent for safety.
   */
  function updateLivePreview() {
    if (previewName) {
      const val = nameInput ? nameInput.value.trim() : '';
      previewName.textContent = val ? val : 'Not entered';
    }
    if (previewEmail) {
      const val = emailInput ? emailInput.value.trim() : '';
      previewEmail.textContent = val ? val : 'Not entered';
    }
    if (previewPhone) {
      const val = phoneInput ? phoneInput.value.trim() : '';
      previewPhone.textContent = val ? val : 'Not entered';
    }
    if (previewCourse) {
      const val = courseInput ? courseInput.value : '';
      previewCourse.textContent = val ? val : 'Not selected';
    }
    if (previewTerms) {
      const isChecked = termsCheckbox ? termsCheckbox.checked : false;
      previewTerms.textContent = isChecked ? 'Accepted' : 'Pending';
      previewTerms.className = isChecked ? 'badge bg-success-light text-success fw-bold' : 'badge bg-warning-light text-warning fw-bold';
    }
  }

  // --------------------------------------------------------------------------
  // 4. SHOW / HIDE PASSWORD INTERACTION
  // --------------------------------------------------------------------------
  function setupPasswordToggle(btn, input) {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const currentType = input.getAttribute('type');
      const icon = btn.querySelector('i');
      if (currentType === 'password') {
        input.setAttribute('type', 'text');
        if (icon) icon.className = 'bi bi-eye-slash-fill';
        btn.setAttribute('aria-label', 'Hide Password');
      } else {
        input.setAttribute('type', 'password');
        if (icon) icon.className = 'bi bi-eye-fill';
        btn.setAttribute('aria-label', 'Show Password');
      }
    });
  }

  setupPasswordToggle(togglePasswordBtn, passwordInput);
  setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

  // --------------------------------------------------------------------------
  // 5. EVENT LISTENERS FOR REAL-TIME VALIDATION (input, blur, change)
  // --------------------------------------------------------------------------

  // Full Name
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updateCharacterCount();
      updateLivePreview();
      if (nameInput.value.trim().length > 0) {
        setFieldState(nameInput, 'name-error', validateName(nameInput.value));
      } else {
        clearFieldState(nameInput, 'name-error');
      }
    });
    nameInput.addEventListener('blur', () => {
      setFieldState(nameInput, 'name-error', validateName(nameInput.value));
    });
  }

  // Email
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      updateLivePreview();
      if (emailInput.value.trim().length > 0) {
        setFieldState(emailInput, 'email-error', validateEmail(emailInput.value));
      } else {
        clearFieldState(emailInput, 'email-error');
      }
    });
    emailInput.addEventListener('blur', () => {
      setFieldState(emailInput, 'email-error', validateEmail(emailInput.value));
    });
  }

  // Phone
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      updateLivePreview();
      if (phoneInput.value.trim().length > 0) {
        setFieldState(phoneInput, 'phone-error', validatePhone(phoneInput.value));
      } else {
        clearFieldState(phoneInput, 'phone-error');
      }
    });
    phoneInput.addEventListener('blur', () => {
      setFieldState(phoneInput, 'phone-error', validatePhone(phoneInput.value));
    });
  }

  // Age
  if (ageInput) {
    ageInput.addEventListener('input', () => {
      if (ageInput.value.trim().length > 0) {
        setFieldState(ageInput, 'age-error', validateAge(ageInput.value));
      } else {
        clearFieldState(ageInput, 'age-error');
      }
    });
    ageInput.addEventListener('blur', () => {
      setFieldState(ageInput, 'age-error', validateAge(ageInput.value));
    });
  }

  // Course Select
  if (courseInput) {
    courseInput.addEventListener('change', () => {
      updateLivePreview();
      setFieldState(courseInput, 'course-error', validateCourse(courseInput.value));
    });
  }

  // Password Input
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      updatePasswordStrengthMeter(val);
      if (val.length > 0) {
        setFieldState(passwordInput, 'password-error', validatePassword(val));
      } else {
        clearFieldState(passwordInput, 'password-error');
      }
      if (confirmPasswordInput && confirmPasswordInput.value.length > 0) {
        setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(confirmPasswordInput.value, val));
      }
    });
    passwordInput.addEventListener('blur', () => {
      setFieldState(passwordInput, 'password-error', validatePassword(passwordInput.value));
    });
  }

  // Confirm Password Input
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      const val = confirmPasswordInput.value;
      const passVal = passwordInput ? passwordInput.value : '';
      if (val.length > 0) {
        setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(val, passVal));
      } else {
        clearFieldState(confirmPasswordInput, 'confirmPassword-error');
      }
    });
    confirmPasswordInput.addEventListener('blur', () => {
      const passVal = passwordInput ? passwordInput.value : '';
      setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(confirmPasswordInput.value, passVal));
    });
  }

  // Terms and Conditions Checkbox
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      updateLivePreview();
      setFieldState(termsCheckbox, 'terms-error', validateTerms(termsCheckbox.checked));
    });
  }

  // --------------------------------------------------------------------------
  // 6. FORM SUBMISSION FLOW
  // --------------------------------------------------------------------------
  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent standard page reload

      // Run full validation on every field
      const nameRes = validateName(nameInput ? nameInput.value : '');
      const emailRes = validateEmail(emailInput ? emailInput.value : '');
      const phoneRes = validatePhone(phoneInput ? phoneInput.value : '');
      const ageRes = validateAge(ageInput ? ageInput.value : '');
      const courseRes = validateCourse(courseInput ? courseInput.value : '');
      const passwordRes = validatePassword(passwordInput ? passwordInput.value : '');
      const confirmPassRes = validateConfirmPassword(
        confirmPasswordInput ? confirmPasswordInput.value : '',
        passwordInput ? passwordInput.value : ''
      );
      const termsRes = validateTerms(termsCheckbox ? termsCheckbox.checked : false);

      // Render visual validation feedback
      setFieldState(nameInput, 'name-error', nameRes);
      setFieldState(emailInput, 'email-error', emailRes);
      setFieldState(phoneInput, 'phone-error', phoneRes);
      setFieldState(ageInput, 'age-error', ageRes);
      setFieldState(courseInput, 'course-error', courseRes);
      setFieldState(passwordInput, 'password-error', passwordRes);
      setFieldState(confirmPasswordInput, 'confirmPassword-error', confirmPassRes);
      setFieldState(termsCheckbox, 'terms-error', termsRes);

      const allValid = nameRes.isValid &&
                       emailRes.isValid &&
                       phoneRes.isValid &&
                       ageRes.isValid &&
                       courseRes.isValid &&
                       passwordRes.isValid &&
                       confirmPassRes.isValid &&
                       termsRes.isValid;

      if (!allValid) {
        // Focus the first invalid field for improved UX & accessibility
        const invalidFields = [
          { valid: nameRes.isValid, element: nameInput },
          { valid: emailRes.isValid, element: emailInput },
          { valid: phoneRes.isValid, element: phoneInput },
          { valid: ageRes.isValid, element: ageInput },
          { valid: courseRes.isValid, element: courseInput },
          { valid: passwordRes.isValid, element: passwordInput },
          { valid: confirmPassRes.isValid, element: confirmPasswordInput },
          { valid: termsRes.isValid, element: termsCheckbox }
        ];

        const firstInvalid = invalidFields.find(f => !f.valid);
        if (firstInvalid && firstInvalid.element) {
          firstInvalid.element.focus();
        }
        return;
      }

      // Valid Submission -> Store details safely in memory
      isRegistrationComplete = true;
      submittedUserData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        age: ageInput.value.trim(),
        course: courseInput.value,
        timestamp: new Date().toLocaleString()
      };

      // Populate Success Page DOM safely
      if (successName) successName.textContent = submittedUserData.name;
      if (successDetailName) successDetailName.textContent = submittedUserData.name;
      if (successDetailEmail) successDetailEmail.textContent = submittedUserData.email;
      if (successDetailPhone) successDetailPhone.textContent = submittedUserData.phone;
      if (successDetailAge) successDetailAge.textContent = submittedUserData.age;
      if (successDetailCourse) successDetailCourse.textContent = submittedUserData.course;
      if (successTimestamp) successTimestamp.textContent = submittedUserData.timestamp;

      // Navigate smoothly to #success route without page reload
      window.location.hash = '#success';
    });
  }

  // --------------------------------------------------------------------------
  // 7. CLIENT-SIDE ROUTING (SPA Hash Router)
  // --------------------------------------------------------------------------
  const validRoutes = ['#home', '#about', '#features', '#courses', '#register', '#success', '#contact'];

  function handleRouting() {
    let hash = window.location.hash || '#home';
    const cleanHash = hash.split('?')[0];

    // Restrict #success route if registration hasn't been submitted yet
    if (cleanHash === '#success' && !isRegistrationComplete) {
      window.location.hash = '#register';
      return;
    }

    if (validRoutes.includes(cleanHash) || cleanHash === '') {
      // Hide 404 Not Found section
      if (notFoundSection) notFoundSection.style.display = 'none';

      if (cleanHash === '#success') {
        // Show success view, hide main portal content
        if (mainPortalContent) mainPortalContent.style.display = 'none';
        if (successSection) successSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Show main portal content, hide success view
        if (mainPortalContent) mainPortalContent.style.display = 'block';
        if (successSection) successSection.style.display = 'none';

        // Scroll to specific section anchor
        if (cleanHash !== '#home') {
          const targetElement = document.querySelector(cleanHash);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      // Invalid route -> Display 404 / Not Found view
      if (mainPortalContent) mainPortalContent.style.display = 'none';
      if (successSection) successSection.style.display = 'none';
      if (notFoundSection) notFoundSection.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active navigation state in header navbar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === cleanHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Routing Listeners
  window.addEventListener('hashchange', handleRouting);

  // Initial setup on page load
  updateCharacterCount();
  updateLivePreview();
  handleRouting();
});
