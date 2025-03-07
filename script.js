/**
 * EmailJS Configuration
 */

// Your EmailJS Public Key
const EMAILJS_PUBLIC_KEY = "H68q5I02_lgGEnBBP";

// Your EmailJS Service ID (e.g., "gmail", "default_service")
const EMAILJS_SERVICE_ID = "service_cv87qmh";

// Your EmailJS Template ID (e.g., "template_abc123")
const EMAILJS_TEMPLATE_ID = "template_5qulxcj";

// The recipient email address (where messages will be sent)
const RECIPIENT_EMAIL = "adamhincu1@gmail.com";

// Form validation and submission handling
document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    // Audio Wave Animation
    const canvas = document.getElementById('audioWaveCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width, height;
        let isMobile = window.innerWidth < 768;
        
        // Wave parameters
        const waveParams = {
            primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--wave-primary').trim() || '#2563eb',
            secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--wave-secondary').trim() || '#0d9488',
            accentColor: getComputedStyle(document.documentElement).getPropertyValue('--wave-accent').trim() || '#7c3aed',
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--wave-bg').trim() || '#f8fafc',
            waveSpeed: 0.2,           // Slower for more grandiose feel
            waveAmplitude: isMobile ? 0.2 : 0.25,  // Reduced amplitude for better overlay visibility
            waveFrequency: 0.003,     // Lower frequency for smoother waves
            lineWidth: isMobile ? 1 : 1.5,  // Thinner lines for mobile
            topographicLines: isMobile ? 6 : 15,     // Fewer lines for cleaner look with overlay
            topographicSpacing: isMobile ? 10 : 6,     // More spacing for cleaner look
            time: 0
        };
        
        // Function to resize canvas
        function resizeCanvas() {
            const container = canvas.parentElement;
            width = container.clientWidth;
            height = container.clientHeight;
            
            // Check if mobile and update parameters
            isMobile = window.innerWidth < 768;
            waveParams.waveAmplitude = isMobile ? 0.2 : 0.25;
            waveParams.lineWidth = isMobile ? 1 : 1.5;
            waveParams.topographicLines = isMobile ? 6 : 15;
            waveParams.topographicSpacing = isMobile ? 10 : 6;
            
            // Set canvas dimensions with device pixel ratio for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            
            // Scale the context to ensure correct drawing operations
            ctx.scale(dpr, dpr);
            
            // Set canvas CSS dimensions
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }
        
        // Initialize canvas size
        resizeCanvas();
        
        // Add resize event listener with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 200);
        });
        
        // Function to draw a single wave
        function drawWave(baseY, amplitude, frequency, phase, color, alpha = 1) {
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            
            // Optimize by reducing points on mobile
            const step = isMobile ? 3 : 1;
            
            for (let x = 0; x < width; x += step) {
                // Create a natural audio-like wave with multiple frequencies
                const y = baseY + 
                    Math.sin(x * frequency + phase) * amplitude * height * 0.2 +
                    Math.sin(x * frequency * 1.5 + phase * 0.8) * amplitude * height * 0.1 +
                    Math.sin(x * frequency * 0.5 + phase * 1.2) * amplitude * height * 0.05 +
                    // Add some higher frequency components for more audio-like appearance
                    Math.sin(x * frequency * 3 + phase * 1.5) * amplitude * height * 0.025;
                
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            
            // Create gradient fill - adjusted for light mode
            const gradient = ctx.createLinearGradient(0, baseY - amplitude * height * 0.3, 0, height);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to transparent
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            return { baseY, amplitude, frequency, phase, color };
        }
        
        // Function to draw topographic lines for a wave
        function drawTopographicLines(wave, lineCount, spacing, lineWidth, alpha = 0.5) {
            const { baseY, amplitude, frequency, phase, color } = wave;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = alpha;
            
            // Optimize by reducing the number of lines on mobile
            const actualLineCount = isMobile ? Math.min(lineCount, 6) : lineCount;
            const actualSpacing = isMobile ? Math.max(spacing, 10) : spacing;
            
            for (let i = 1; i <= actualLineCount; i++) {
                const level = i / actualLineCount;
                const levelY = baseY + (height - baseY) * level;
                
                ctx.beginPath();
                let isDrawing = false;
                
                for (let x = 0; x < width; x += actualSpacing) {
                    const waveY = baseY + 
                        Math.sin(x * frequency + phase) * amplitude * height * 0.2 +
                        Math.sin(x * frequency * 1.5 + phase * 0.8) * amplitude * height * 0.1 +
                        Math.sin(x * frequency * 0.5 + phase * 1.2) * amplitude * height * 0.05 +
                        Math.sin(x * frequency * 3 + phase * 1.5) * amplitude * height * 0.025;
                    
                    // Only draw points where the wave is below the current level
                    if (waveY >= levelY) {
                        if (!isDrawing) {
                            ctx.moveTo(x, waveY);
                            isDrawing = true;
                        } else {
                            ctx.lineTo(x, waveY);
                        }
                    } else {
                        isDrawing = false;
                    }
                }
                
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
        }
        
        // Animation function
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Update time
            waveParams.time += 0.01 * waveParams.waveSpeed;
            
            // Draw background
            ctx.fillStyle = waveParams.backgroundColor;
            ctx.fillRect(0, 0, width, height);
            
            // Draw waves with different parameters
            const waves = [];
            
            // Primary wave (blue)
            waves.push(drawWave(
                height * (isMobile ? 0.75 : 0.7),
                waveParams.waveAmplitude * 1.2,
                waveParams.waveFrequency,
                waveParams.time,
                waveParams.primaryColor,
                0.4  // Reduced opacity for light mode
            ));
            
            // Secondary wave (teal/green)
            waves.push(drawWave(
                height * (isMobile ? 0.65 : 0.6),
                waveParams.waveAmplitude * 0.9,
                waveParams.waveFrequency * 1.3,
                waveParams.time * 0.7,
                waveParams.secondaryColor,
                0.3  // Reduced opacity for light mode
            ));
            
            // Accent wave (purple)
            waves.push(drawWave(
                height * (isMobile ? 0.55 : 0.5),
                waveParams.waveAmplitude * 0.7,
                waveParams.waveFrequency * 0.7,
                waveParams.time * 1.3,
                waveParams.accentColor,
                0.25  // Reduced opacity for light mode
            ));
            
            // Draw topographic lines for each wave
            waves.forEach(wave => {
                drawTopographicLines(
                    wave,
                    waveParams.topographicLines,
                    waveParams.topographicSpacing,
                    waveParams.lineWidth,
                    0.2  // Reduced opacity for light mode
                );
            });
            
            // Add subtle glow effect (only on desktop for performance)
            if (!isMobile) {
                const glowRadius = Math.sin(waveParams.time * 0.5) * 2 + 3; // Reduced glow for light mode
                ctx.shadowBlur = glowRadius;
                ctx.shadowColor = waveParams.primaryColor;
                
                // Draw a subtle center line to mimic audio waveform
                ctx.beginPath();
                ctx.moveTo(0, height * 0.5);
                ctx.lineTo(width, height * 0.5);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)'; // Dark line for light mode
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Reset shadow
                ctx.shadowBlur = 0;
            } else {
                // Simpler center line for mobile
                ctx.beginPath();
                ctx.moveTo(0, height * 0.5);
                ctx.lineTo(width, height * 0.5);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)'; // Dark line for light mode
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Continue animation
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // Start animation
        animate();
        
        // Clean up animation on page unload
        window.addEventListener('beforeunload', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        });
        
        // Pause animation when not visible to save resources
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationFrameId) {
                        animate();
                    }
                } else {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(canvas);
    }
    
    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formGroups = contactForm.querySelectorAll('.form-group');
        const submitButton = contactForm.querySelector('.submit-button');
        
        // Add focus effects to form fields
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                group.classList.remove('focused');
                
                // Simple validation on blur
                if (input.value.trim() === '' && input.hasAttribute('required')) {
                    input.classList.add('error');
                    
                    // Add error message if it doesn't exist
                    if (!group.querySelector('.error-message')) {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.textContent = `${input.previousElementSibling.textContent} is required`;
                        group.appendChild(errorMessage);
                    }
                } else {
                    input.classList.remove('error');
                    
                    // Remove error message if it exists
                    const errorMessage = group.querySelector('.error-message');
                    if (errorMessage) {
                        group.removeChild(errorMessage);
                    }
                    
                    // Email validation
                    if (input.type === 'email' && input.value.trim() !== '') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value.trim())) {
                            input.classList.add('error');
                            
                            // Add error message if it doesn't exist
                            if (!group.querySelector('.error-message')) {
                                const errorMessage = document.createElement('div');
                                errorMessage.className = 'error-message';
                                errorMessage.textContent = 'Please enter a valid email address';
                                group.appendChild(errorMessage);
                            }
                        }
                    }
                }
            });
        });
        
        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate all fields before submission
            let isValid = true;
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                
                // Trigger blur event to run validation
                const blurEvent = new Event('blur');
                input.dispatchEvent(blurEvent);
                
                if (input.classList.contains('error')) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                return;
            }
            
            // Disable submit button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            // Get form data
            const name = contactForm.querySelector('#name').value;
            const email = contactForm.querySelector('#email').value;
            const message = contactForm.querySelector('#message').value;
            
            try {
                // Send email using EmailJS
                const response = await emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    {
                        from_name: name,
                        from_email: email,
                        message: message,
                        to_email: RECIPIENT_EMAIL,
                        reply_to: email
                    }
                );
                
                // Show success message
                contactForm.innerHTML = `
                    <div class="success-message">
                        <h3>Message Sent Successfully!</h3>
                        <p>Thank you for reaching out. I'll get back to you as soon as possible.</p>
                    </div>
                `;
                
                // Scroll to success message
                contactForm.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
                
                // Show error message
                if (!contactForm.querySelector('.form-error')) {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'error-message form-error';
                    errorElement.textContent = 'There was an error sending your message. Please try again later.';
                    contactForm.prepend(errorElement);
                    
                    // Remove error after 5 seconds
                    setTimeout(() => {
                        const formError = contactForm.querySelector('.form-error');
                        if (formError) {
                            formError.remove();
                        }
                    }, 5000);
                }
                
                console.error('EmailJS Error:', error);
            }
        });
    }
}); 