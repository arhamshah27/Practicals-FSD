// API Base URL
const API_URL = 'http://localhost:5000/api/students';

// DOM Elements
const studentsList = document.getElementById('studentsList');
const studentForm = document.getElementById('studentForm');
const editStudentForm = document.getElementById('editStudentForm');
const editModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
const updateStudentBtn = document.getElementById('updateStudentBtn');

// Load students when page loads
document.addEventListener('DOMContentLoaded', loadStudents);

// Add new student
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous error messages
    clearValidationErrors();
    
    // Validate form
    if (!validateStudentForm()) {
        return;
    }
    
    const studentData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        grade: document.getElementById('grade').value,
        subjects: document.getElementById('subjects').value.split(',').map(s => s.trim()),
        status: 'active', // Default status for new students
        parentName: document.getElementById('parentName').value,
        parentContact: document.getElementById('parentContact').value,
        address: {
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add student');
        }
        
        // Reset form and reload students
        studentForm.reset();
        loadStudents();
        showAlert('success', 'Student added successfully!');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Error adding student');
    }
});

// Update student
updateStudentBtn.addEventListener('click', async () => {
    // Clear previous error messages
    clearValidationErrors('edit');
    
    // Validate form
    if (!validateStudentForm('edit')) {
        return;
    }
    
    const id = document.getElementById('editId').value;
    const studentData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        grade: document.getElementById('editGrade').value,
        subjects: document.getElementById('editSubjects').value.split(',').map(s => s.trim()),
        status: document.getElementById('editStatus').value,
        parentName: document.getElementById('editParentName').value,
        parentContact: document.getElementById('editParentContact').value,
        address: {
            street: document.getElementById('editStreet').value,
            city: document.getElementById('editCity').value,
            state: document.getElementById('editState').value,
            zipCode: document.getElementById('editZipCode').value
        }
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update student');
        }
        
        // Close modal and reload students
        editModal.hide();
        loadStudents();
        showAlert('success', 'Student updated successfully!');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Error updating student');
    }
});

// Load all students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Display students in the UI
function displayStudents(students) {
    studentsList.innerHTML = '';
    
    if (students.length === 0) {
        studentsList.innerHTML = '<div class="col-12"><p>No students found</p></div>';
        return;
    }

    students.forEach(student => {
        const studentEl = document.createElement('div');
        studentEl.className = 'col-md-6 col-lg-4';
        
        // Format parent info if available
        let parentInfo = '';
        if (student.parentName || student.parentContact) {
            parentInfo = `<i class="bi bi-person"></i> ${student.parentName || 'N/A'}`;
            if (student.parentContact) {
                parentInfo += ` (${student.parentContact})`;
            }
            parentInfo += '<br>';
        }
        
        // Format address if available
        let addressInfo = '';
        if (student.address) {
            const address = student.address;
            const addressParts = [];
            if (address.street) addressParts.push(address.street);
            if (address.city) addressParts.push(address.city);
            if (address.state) addressParts.push(address.state);
            if (address.zipCode) addressParts.push(address.zipCode);
            
            if (addressParts.length > 0) {
                addressInfo = `<i class="bi bi-geo-alt"></i> ${addressParts.join(', ')}<br>`;
            }
        }
        
        studentEl.innerHTML = `
            <div class="card student-card status-${student.status}">
                <div class="card-body">
                    <h5 class="card-title">${student.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Grade: ${student.grade}</h6>
                    <p class="card-text">
                        <i class="bi bi-envelope"></i> ${student.email}<br>
                        <i class="bi bi-telephone"></i> ${student.phone}<br>
                        <i class="bi bi-book"></i> ${student.subjects.join(', ')}<br>
                        ${parentInfo}
                        ${addressInfo}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-${getStatusBadgeClass(student.status)}">
                            ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent('${student._id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${student._id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        studentsList.appendChild(studentEl);
    });
}

// Get badge class based on status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'danger';
        case 'on_hold': return 'warning';
        default: return 'secondary';
    }
}

// Edit student
window.editStudent = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();
        
        document.getElementById('editId').value = student._id;
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editPhone').value = student.phone;
        document.getElementById('editGrade').value = student.grade;
        document.getElementById('editSubjects').value = student.subjects.join(', ');
        document.getElementById('editStatus').value = student.status;
        document.getElementById('editParentName').value = student.parentName;
        document.getElementById('editParentContact').value = student.parentContact;
        
        // Address fields
        if (student.address) {
            document.getElementById('editStreet').value = student.address.street || '';
            document.getElementById('editCity').value = student.address.city || '';
            document.getElementById('editState').value = student.address.state || '';
            document.getElementById('editZipCode').value = student.address.zipCode || '';
        }
        
        editModal.show();
    } catch (error) {
        console.error('Error fetching student:', error);
        alert('Error loading student data');
    }
};

// Delete student
window.deleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete student');
        }
        
        loadStudents();
        showAlert('success', 'Student deleted successfully!');
    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || 'Error deleting student');
    }
};

// Form validation functions
function validateStudentForm(formType = '') {
    let isValid = true;
    const prefix = formType ? formType : '';
    
    // Required fields
    const requiredFields = [
        { id: `${prefix}Name`, name: 'Name' },
        { id: `${prefix}Email`, name: 'Email' },
        { id: `${prefix}Phone`, name: 'Phone' },
        { id: `${prefix}Grade`, name: 'Grade' },
        { id: `${prefix}Subjects`, name: 'Subjects' }
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input.value.trim()) {
            showValidationError(input, `${field.name} is required`);
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById(`${prefix}Email`);
    if (emailField.value.trim() && !validateEmail(emailField.value.trim())) {
        showValidationError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone format
    const phoneField = document.getElementById(`${prefix}Phone`);
    if (phoneField.value.trim() && !validatePhone(phoneField.value.trim())) {
        showValidationError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/[\s-()]/g, ''));
}

function showValidationError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback d-block';
    errorDiv.innerText = message;
    formGroup.appendChild(errorDiv);
    input.classList.add('is-invalid');
}

function clearValidationErrors(formType = '') {
    const form = formType === 'edit' ? document.getElementById('editStudentForm') : studentForm;
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

// Alert function
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}
