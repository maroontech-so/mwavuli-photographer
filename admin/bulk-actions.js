(function () {
    'use strict';

    const API = window.API_BASE
        || (!window.location.port || window.location.port === '5000'
            ? ''
            : (window.location.protocol === 'file:'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`));

    function ensureElements() {
        if (!document.getElementById('confirmOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'confirmOverlay';
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-modal">
                    <div class="confirm-icon">!</div>
                    <h3 id="confirmTitle">Confirm</h3>
                    <p id="confirmMessage">Are you sure?</p>
                    <div class="confirm-actions">
                        <button class="btn-cancel" id="confirmCancel">Cancel</button>
                        <button class="btn-danger" id="confirmBtn">Delete</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    ensureElements();

    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    const confirmCancel = document.getElementById('confirmCancel');
    let confirmCallback = null;

    const { apiFetch } = window.adminAuth || {};

    function openConfirm(title, message, onConfirm) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmCallback = onConfirm;
        confirmBtn.textContent = 'Delete';
        confirmOverlay.classList.add('open');
    }

    function closeConfirm() {
        confirmOverlay.classList.remove('open');
        confirmCallback = null;
    }

    confirmCancel.addEventListener('click', closeConfirm);
    confirmOverlay.addEventListener('click', (e) => {
        if (e.target === confirmOverlay) closeConfirm();
    });
    confirmBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirm();
    });

    window.confirmDelete = function (title, message, callback) {
        openConfirm(title, message, callback);
    };

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-body">${message}</div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    window.showToast = showToast;

    window.enableBulkDelete = function (options) {
        const {
            containerId,
            itemClass,
            getId,
            deleteUrl,
            loadFn,
            successMsg = 'Deleted successfully'
        } = options;

        const container = document.getElementById(containerId);
        if (!container) return;

        let selected = new Set();

        function updateBulkBar() {
            let bar = document.querySelector('.bulk-bar');
            if (!bar) {
                bar = document.createElement('div');
                bar.className = 'bulk-bar';
                bar.innerHTML = `
                    <span class="bulk-count">0 selected</span>
                    <button class="bulk-btn bulk-cancel">Cancel</button>
                    <button class="bulk-btn bulk-delete">Delete Selected</button>
                `;
                document.body.appendChild(bar);

                bar.querySelector('.bulk-cancel').addEventListener('click', clearSelection);
                bar.querySelector('.bulk-delete').addEventListener('click', () => {
                    if (!selected.size) return;
                    const count = selected.size;
                    window.confirmDelete(
                        `Delete ${count} item${count > 1 ? 's' : ''}?`,
                        `This action cannot be undone.`,
                        async () => {
                            const ids = Array.from(selected);
                            let lastError = null;
                            for (const id of ids) {
                                try {
                                    await (window.adminAuth && window.adminAuth.apiFetch(`${API}${deleteUrl}/${id}`, { method: 'DELETE' }));
                                } catch (err) {
                                    lastError = err;
                                }
                            }
                            if (!lastError) {
                                showToast(`${count} item${count > 1 ? 's' : ''} deleted`, 'success');
                            } else {
                                showToast('Some items could not be deleted', 'error');
                            }
                            clearSelection();
                            if (typeof loadFn === 'function') loadFn();
                        }
                    );
                });
            }

            const countEl = bar.querySelector('.bulk-count');
            countEl.textContent = `${selected.size} selected`;

            if (selected.size > 0) {
                bar.classList.add('visible');
            } else {
                bar.classList.remove('visible');
            }
        }

        function clearSelection() {
            selected.clear();
            container.querySelectorAll(`.${itemClass}`).forEach(el => {
                el.classList.remove('selected');
                const cb = el.querySelector('.card-checkbox');
                if (cb) cb.checked = false;
            });
            updateBulkBar();
        }

        container.addEventListener('change', (e) => {
            if (!e.target.classList.contains('card-checkbox')) return;
            const card = e.target.closest(`.${itemClass}`);
            if (!card) return;
            const id = card.dataset.id;
            if (e.target.checked) {
                selected.add(id);
                card.classList.add('selected');
            } else {
                selected.delete(id);
                card.classList.remove('selected');
            }
            updateBulkBar();
        });

        return { clearSelection, updateBulkBar };
    };
})();
