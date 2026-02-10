   let score = 0;
        let streak = 0;
        let level = 1;
        let currentMode = 'addition';
        let currentWhole = 10;
        let correctPart1 = 0;
        let correctPart2 = 0;
        let slot1Value = null;
        let slot2Value = null;
        let draggedTile = null;

        function setMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            const gameArea = document.getElementById('gameArea');
            gameArea.className = 'game-area ' + mode + '-mode';
            
            if (mode === 'addition') {
                document.getElementById('instruction').textContent = 'Drag numbers to fill the slots!';
            } else {
                document.getElementById('instruction').textContent = 'What number should be subtracted?';
            }
            
            newProblem();
        }

        function generateProblem() {
            const maxNumber = Math.min(5 + level * 2, 20);
            currentWhole = Math.floor(Math.random() * (maxNumber - 3)) + 4;
            correctPart1 = Math.floor(Math.random() * (currentWhole - 1)) + 1;
            correctPart2 = currentWhole - correctPart1;
            
            slot1Value = null;
            slot2Value = null;
            
            updateDisplay();
            generateNumberTiles();
            document.getElementById('feedback').textContent = '';
            document.getElementById('feedback').className = 'feedback';
        }

        function updateDisplay() {
            const display = document.getElementById('bondDisplay');
            
            if (currentMode === 'addition') {
                display.innerHTML = `
                    <div class="whole-number" id="wholeNumber">${currentWhole}</div>
                    <div style="font-size: 1.5em; margin: 10px 0;">⬇️ breaks into ⬇️</div>
                    <div class="parts-container">
                        <div class="part-slot" data-slot="1">?</div>
                        <div class="part-slot" data-slot="2">?</div>
                    </div>
                `;
            } else {
                display.innerHTML = `
                    <div class="whole-number" id="wholeNumber">${currentWhole}</div>
                    <div class="operator">−</div>
                    <div class="part-slot" data-slot="1">?</div>
                    <div class="operator">=</div>
                    <div class="part-slot" data-slot="2">?</div>
                `;
            }
            
            setupSlotListeners();
        }

        function setupSlotListeners() {
            document.querySelectorAll('.part-slot').forEach(slot => {
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('dragleave', handleDragLeave);
                slot.addEventListener('drop', handleDrop);
            });
        }

        function resetSlots() {
            slot1Value = null;
            slot2Value = null;
            
            document.querySelectorAll('.part-slot').forEach(slot => {
                slot.textContent = '?';
                slot.classList.remove('filled', 'drag-over');
            });
            
            document.querySelectorAll('.number-tile').forEach(tile => {
                tile.classList.remove('used');
            });
        }

        function generateNumberTiles() {
            const container = document.getElementById('numberTiles');
            container.innerHTML = '';
            
            // Create array with correct answers
            const numbers = [correctPart1, correctPart2];
            
            // Add distractors that are NOT equal to whole/2 (to avoid duplicate valid answers)
            const half = currentWhole / 2;
            let attempts = 0;
            while (numbers.length < 6 && attempts < 30) {
                const num = Math.floor(Math.random() * currentWhole) + 1;
                // Exclude: numbers already in array, numbers >= whole, and whole/2 if it's an integer
                if (!numbers.includes(num) && num < currentWhole && num !== half) {
                    numbers.push(num);
                }
                attempts++;
            }
            
            // Shuffle
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
            
            // Create tiles with drag functionality
            numbers.forEach(num => {
                const tile = document.createElement('div');
                tile.className = 'number-tile';
                tile.textContent = num;
                tile.draggable = true;
                tile.dataset.value = num;
                
                // Desktop drag
                tile.addEventListener('dragstart', handleDragStart);
                tile.addEventListener('dragend', handleDragEnd);
                
                // Touch drag
                tile.addEventListener('touchstart', handleTouchStart);
                tile.addEventListener('touchmove', handleTouchMove);
                tile.addEventListener('touchend', handleTouchEnd);
                
                container.appendChild(tile);
            });
        }

        // Desktop drag handlers
        function handleDragStart(e) {
            if (this.classList.contains('used')) {
                e.preventDefault();
                return;
            }
            draggedTile = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.value);
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedTile = null;
        }

        function handleDragOver(e) {
            if (!draggedTile) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (!draggedTile) return;
            
            const value = parseInt(e.dataTransfer.getData('text/plain'));
            placeNumberInSlot(this, value, draggedTile);
        }

        // Touch drag handlers
        let touchStartX, touchStartY;
        let clonedTile = null;

        function handleTouchStart(e) {
            if (this.classList.contains('used')) return;
            
            draggedTile = this;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            
            this.classList.add('dragging');
        }

        function handleTouchMove(e) {
            if (!draggedTile) return;
            e.preventDefault();
        }

        function handleTouchEnd(e) {
            if (!draggedTile) return;
            
            const touch = e.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            
            draggedTile.classList.remove('dragging');
            
            if (dropTarget && dropTarget.classList.contains('part-slot')) {
                const value = parseInt(draggedTile.dataset.value);
                placeNumberInSlot(dropTarget, value, draggedTile);
            }
            
            draggedTile = null;
        }

        function placeNumberInSlot(slot, value, tile) {
            const slotNum = slot.dataset.slot;
            
            // If slot already filled, don't allow
            if (slot.classList.contains('filled')) return;
            
            if (slotNum === '1') {
                slot1Value = value;
            } else {
                slot2Value = value;
            }
            
            slot.textContent = value;
            slot.classList.add('filled');
            tile.classList.add('used');
        }

        function checkAnswer() {
            if (slot1Value === null || slot2Value === null) {
                showFeedback('Please fill both slots! 🤔', 'error');
                return;
            }
            
            let isCorrect = false;
            
            if (currentMode === 'addition') {
                const sum = slot1Value + slot2Value;
                isCorrect = (sum === currentWhole);
                
                if (!isCorrect) {
                    showFeedback(`Not quite! ${slot1Value} + ${slot2Value} = ${sum}, not ${currentWhole}. Try again! 💪`, 'error');
                }
            } else {
                const diff = currentWhole - slot1Value;
                isCorrect = (diff === slot2Value);
                
                if (!isCorrect) {
                    showFeedback(`Not quite! ${currentWhole} − ${slot1Value} = ${diff}, not ${slot2Value}. Try again! 💪`, 'error');
                }
            }
            
            if (isCorrect) {
                score += 10 * level;
                streak++;
                
                if (streak % 5 === 0) {
                    level++;
                    showFeedback(`🎉 Amazing! Level Up to ${level}! 🎊`, 'success');
                } else {
                    const messages = [
                        '🌟 Perfect! You got it!',
                        '🎯 Excellent work!',
                        '⭐ Super job!',
                        '🎨 You\'re a star!',
                        '🚀 Outstanding!'
                    ];
                    showFeedback(messages[Math.floor(Math.random() * messages.length)], 'success');
                }
                
                createConfetti();
                updateScore();
                
                setTimeout(() => {
                    newProblem();
                }, 1500);
            } else {
                streak = 0;
                updateScore();
            }
        }

        function showFeedback(message, type) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = message;
            feedback.className = 'feedback ' + type;
        }

        function updateScore() {
            document.getElementById('score').textContent = score;
            document.getElementById('streak').textContent = streak;
            document.getElementById('level').textContent = level;
        }

        function createConfetti() {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.style.position = 'fixed';
                    confetti.style.left = Math.random() * window.innerWidth + 'px';
                    confetti.style.top = '-10px';
                    confetti.style.width = '10px';
                    confetti.style.height = '10px';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.zIndex = '1000';
                    confetti.style.pointerEvents = 'none';
                    confetti.style.transform = 'translateY(0)';
                    confetti.style.transition = 'transform 3s linear, opacity 3s linear';
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.style.transform = 'translateY(' + window.innerHeight + 'px) rotate(360deg)';
                        confetti.style.opacity = '0';
                    }, 10);
                    
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 50);
            }
        }

        function newProblem() {
            generateProblem();
        }

        // Initialize
        generateProblem();