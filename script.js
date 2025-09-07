// JavaScript for Criminal Justice Reform Survey
// This handles the conditional "specify" fields that appear under checkboxes

let currentStep = 1;
const totalSteps = 5; // Fixed: Changed from 4 to 5 to match HTML sections

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    updateProgress();
    setupConditionalFields();
    setupFormNavigation();
    showSection(currentStep);
});

function setupConditionalFields() {
    // Find all checkboxes that have conditional specify fields
    const checkboxesWithSpecify = document.querySelectorAll('input[type="checkbox"][data-specify="true"]');
    
    checkboxesWithSpecify.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Find the specify field within the same label
            const label = this.closest('label');
            const specifyField = label.querySelector('.specify-field');
            
            if (specifyField) {
                if (this.checked) {
                    // Show the specify field with smooth animation
                    specifyField.style.display = 'block';
                    specifyField.style.opacity = '0';
                    specifyField.style.transform = 'translateY(-10px)';
                    
                    // Animate in
                    setTimeout(() => {
                        specifyField.style.transition = 'all 0.3s ease';
                        specifyField.style.opacity = '1';
                        specifyField.style.transform = 'translateY(0)';
                    }, 10);
                    
                    // Focus on the text input
                    const input = specifyField.querySelector('input[type="text"]');
                    if (input) {
                        setTimeout(() => input.focus(), 300);
                    }
                } else {
                    // Hide the specify field with animation
                    specifyField.style.transition = 'all 0.3s ease';
                    specifyField.style.opacity = '0';
                    specifyField.style.transform = 'translateY(-10px)';
                    
                    setTimeout(() => {
                        specifyField.style.display = 'none';
                        // Clear the input value
                        const input = specifyField.querySelector('input[type="text"]');
                        if (input) input.value = '';
                    }, 300);
                }
            }
        });
    });
}

function setupFormNavigation() {
    // Form submission
    document.getElementById('surveyForm').addEventListener('submit', handleSubmit);
    
    // Role validation
    const roleCheckboxes = document.querySelectorAll('input[name="role"]');
    roleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateRoles);
    });
}

function showSection(step) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show current section
    const currentSection = document.getElementById(`section${step}`);
    if (currentSection) {
        currentSection.classList.add('active');
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = step === 1 ? 'none' : 'block';
    
    if (step === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }
    
    const newStep = currentStep + direction;
    
    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        showSection(currentStep);
        updateProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentStepSpan = document.getElementById('currentStep');
    const totalStepsSpan = document.getElementById('totalSteps');
    
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    currentStepSpan.textContent = currentStep;
    totalStepsSpan.textContent = totalSteps;
}

function validateCurrentStep() {
    if (currentStep === 1) {
        return validateSection1();
    }
    return true; // Other sections are optional
}

function validateSection1() {
    const phone = document.getElementById('phone').value.trim();
    const roleCheckboxes = document.querySelectorAll('input[name="role"]:checked');
    
    if (!phone) {
        alert('Please enter your phone number.');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (roleCheckboxes.length === 0) {
        alert('Please select at least one role or connection to criminal justice reform.');
        return false;
    }
    
    return true;
}

function validateRoles() {
    // This function can be used for real-time validation if needed
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading indicator
    document.getElementById('surveyForm').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'block';
    
    try {
        const formData = collectFormData();
        
        const response = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit survey');
        }
        
        const result = await response.json();
        
        // Show success message
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('There was an error submitting your survey. Please try again.');
        
        // Hide loading indicator and show form again
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('surveyForm').style.display = 'block';
    }
}

function collectFormData() {
    const formData = {
        timestamp: new Date().toISOString(),
        
        // Section 1: Background
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        
        // Roles
        roles: [],
        roleDetails: {},
        
        // Reform selections
        reforms: [],
        reformDetails: {},
        
        // Priorities
        priorities: [],
        
        // Additional input
        additionalInput: document.getElementById('additional_input')?.value.trim() || ''
    };
    
    // Collect roles and their details
    const roleCheckboxes = document.querySelectorAll('input[name="role"]:checked');
    roleCheckboxes.forEach(checkbox => {
        formData.roles.push(checkbox.value);
        
        // Collect role details if specified
        const detailFieldName = checkbox.value + '_detail';
        const detailField = document.querySelector(`input[name="${detailFieldName}"]`);
        if (detailField && detailField.value.trim()) {
            formData.roleDetails[checkbox.value] = detailField.value.trim();
        }
    });
    
    // Collect reform selections
    const reformCheckboxes = document.querySelectorAll('input[name="reforms"]:checked');
    reformCheckboxes.forEach(checkbox => {
        formData.reforms.push(checkbox.value);
    });
    
    // Collect reform details
    const reformDetailFields = document.querySelectorAll('input[name*="_detail"]');
    reformDetailFields.forEach(field => {
        if (field.value.trim() && field.name.includes('_detail')) {
            const reformKey = field.name.replace('_detail', '');
            formData.reformDetails[reformKey] = field.value.trim();
        }
    });
    
    // Collect priorities
    for (let i = 1; i <= 5; i++) {
        const priority = document.getElementById(`priority${i}`)?.value.trim();
        if (priority) {
            formData.priorities.push(priority);
        }
    }
    
    return formData;
}

// Add some visual feedback for checkbox interactions
document.addEventListener('DOMContentLoaded', function() {
    const checkboxLabels = document.querySelectorAll('.checkbox, .checkbox-with-specify');
    
    checkboxLabels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                label.style.borderColor = '#3498db';
                label.style.backgroundColor = '#e8f4fd';
            } else {
                label.style.borderColor = '#e9ecef';
                label.style.backgroundColor = '#ffffff';
            }
        });
    });
});