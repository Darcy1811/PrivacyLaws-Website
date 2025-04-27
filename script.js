document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle (only once)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav ul li a');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // Accordion functionality
    const accordionBtns = document.querySelectorAll('.accordion-btn');
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                this.querySelector('span').textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                this.querySelector('span').textContent = '-';
            }
        });
    });

    // Form submission
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your report. We will review your complaint and get back to you shortly.');
            this.reset();
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active nav link highlighting
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Initialize counters when stats section is visible
    const statsSection = document.querySelector('#stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }
});

// Counter animation functions (outside DOMContentLoaded but won't run until called)
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (obj.textContent.includes('Lakh')) {
            obj.textContent = value + " Lakh";
        } else if (obj.textContent.includes('%')) {
            obj.textContent = value + "%";
        } else {
            obj.textContent = value;
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const suffix = stat.textContent.includes('Lakh') ? ' Lakh' : 
                      stat.textContent.includes('%') ? '%' : '';
        
        // Reset to 0 first
        stat.textContent = '0' + suffix;
        
        // Start animation
        animateValue(stat, 0, target, 2000);
    });
}





// appscript
// Add this to your existing script.js
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  
    const formData = new FormData(form);
  
    try {
      let evidenceData = '';
      let evidenceName = '';
      let evidenceType = '';
  
      const file = formData.get('evidence');
      if (file && file.size > 0) {
        const reader = new FileReader();
        evidenceName = file.name;
        evidenceType = file.type;
        evidenceData = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
  
      // Convert to plain object
      const body = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        issue: formData.get('issue'),
        company: formData.get('company'),
        date: formData.get('date'),
        details: formData.get('details'),
        evidence: evidenceData,
        evidenceFilename: evidenceName,
        evidenceContentType: evidenceType
      };
  
      const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYED_URL/exec', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const result = await response.json();
      if (result.success) {
        alert('Report submitted successfully!');
        form.reset();
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }
  });
  