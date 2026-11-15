(() => {
    /**
     * RADI TERRA - Lógica Principal en TypeScript con Carrito Interactivo
     */

    const RADI_TERRA_CONFIG = {
        whatsappPrimary: '529617125212',
        email: 'raditerra32@gmail.com',
        product: {
            id: 'RT-25KG',
            name: 'RADI TERRA - Sustrato de Excelencia',
            presentation: 'Costal de 25 kg',
            image: 'assets/img/image_b253df.jpg',
            unitPrice: 405
        }
    } as const;

    function sanitizeInput(raw: string): string {
        return raw
            .replace(/[<>'"&`]/g, (char: string): string => {
                const map: Record<string, string> = {
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;',
                    '&': '&amp;',
                    '`': '&#96;'
                };
                return map[char] || '';
            })
            .trim();
    }

    class RadiTerraApp {
        private cartQty: number = 0;
        private sidebar: HTMLElement | null;
        private menuTrigger: HTMLButtonElement | null;
        private hoverZone: HTMLElement | null;
        private closeMenuTimeout: number | null = null;

        constructor() {
            this.sidebar = document.getElementById('sidebar-menu');
            this.menuTrigger = document.getElementById('menu-trigger') as HTMLButtonElement | null;
            this.hoverZone = document.getElementById('menu-hover-zone');

            this.initSlidingMenu();
            this.initProductGallery();
            this.initCartAndCatalog();
            this.initForms();
            this.initTechSheetDownload();
            this.updateCartUI();
        }

        private initSlidingMenu(): void {
            if (!this.sidebar || !this.menuTrigger) return;

            const openMenu = (): void => {
                if (this.closeMenuTimeout !== null) {
                    window.clearTimeout(this.closeMenuTimeout);
                    this.closeMenuTimeout = null;
                }
                this.sidebar?.classList.add('is-open');
                this.sidebar?.setAttribute('aria-hidden', 'false');
                this.menuTrigger?.setAttribute('aria-expanded', 'true');
            };

            const scheduleCloseMenu = (): void => {
                this.closeMenuTimeout = window.setTimeout(() => {
                    this.sidebar?.classList.remove('is-open');
                    this.sidebar?.setAttribute('aria-hidden', 'true');
                    this.menuTrigger?.setAttribute('aria-expanded', 'false');
                }, 220);
            };

            this.menuTrigger.addEventListener('mouseenter', openMenu);
            this.hoverZone?.addEventListener('mouseenter', openMenu);
            this.sidebar.addEventListener('mouseenter', openMenu);

            this.menuTrigger.addEventListener('mouseleave', scheduleCloseMenu);
            this.sidebar.addEventListener('mouseleave', scheduleCloseMenu);

            this.menuTrigger.addEventListener('click', () => {
                const isOpen = this.sidebar?.classList.contains('is-open');
                if (isOpen) {
                    scheduleCloseMenu();
                } else {
                    openMenu();
                }
            });

            const navLinks = this.sidebar.querySelectorAll<HTMLAnchorElement>('.nav-link');
            navLinks.forEach((link) => {
                link.addEventListener('click', () => {
                    this.sidebar?.classList.remove('is-open');
                });
            });
        }

        private initProductGallery(): void {
            const featuredImg = document.getElementById('featured-product-img') as HTMLImageElement | null;
            const thumbButtons = document.querySelectorAll<HTMLButtonElement>('.thumb-btn');

            if (!featuredImg) return;

            thumbButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const targetSrc = btn.getAttribute('data-img');
                    if (targetSrc && targetSrc.startsWith('assets/img/')) {
                        featuredImg.src = targetSrc;
                        thumbButtons.forEach((b) => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                });
            });
        }

        private initCartAndCatalog(): void {
            const qtyInput = document.getElementById('product-qty') as HTMLInputElement | null;
            const addToCartBtn = document.getElementById('add-to-cart-btn');
            const buyWhatsappBtn = document.getElementById('buy-whatsapp-btn');
            const cartToggleBtn = document.getElementById('cart-Toggle');
            const closeCartBtn = document.getElementById('close-cart-btn');
            const cartModal = document.getElementById('cart-modal');
            const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');

            addToCartBtn?.addEventListener('click', () => {
                const added = Math.max(1, Math.min(500, Number(qtyInput?.value || 1)));
                this.cartQty = Math.min(500, this.cartQty + added);
                this.updateCartUI();
                cartModal?.classList.add('is-visible');
            });

            buyWhatsappBtn?.addEventListener('click', () => {
                const qty = Math.max(1, Math.min(500, Number(qtyInput?.value || 1)));
                const total = qty * RADI_TERRA_CONFIG.product.unitPrice;
                const text = `Hola RADI TERRA, deseo realizar una compra de ${qty} costal(es) de 25 kg ($${total} MXN en total).`;
                this.openSecureWhatsApp(text);
            });

            cartToggleBtn?.addEventListener('click', () => {
                cartModal?.classList.add('is-visible');
            });

            closeCartBtn?.addEventListener('click', () => {
                cartModal?.classList.remove('is-visible');
            });

            // Cerrar modal al hacer clic fuera de la caja blanca
            cartModal?.addEventListener('click', (e: MouseEvent) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('is-visible');
                }
            });

            checkoutWhatsappBtn?.addEventListener('click', () => {
                if (this.cartQty <= 0) return;
                const total = this.cartQty * RADI_TERRA_CONFIG.product.unitPrice;
                const text = `Hola RADI TERRA, confirmo mi pedido del carrito por ${this.cartQty} costal(es) de 25 kg. Total: $${total} MXN.`;
                this.openSecureWhatsApp(text);
            });
        }

        /**
         * Actualiza el carrito con controles para restar, sumar, editar o eliminar unidades
         */
        private updateCartUI(): void {
            const countBadge = document.getElementById('cart-count');
            const container = document.getElementById('cart-items-container');
            const totalEl = document.getElementById('cart-total-amount');
            const checkoutBtn = document.getElementById('checkout-whatsapp-btn') as HTMLButtonElement | null;

            if (countBadge) countBadge.textContent = String(this.cartQty);

            const total = this.cartQty * RADI_TERRA_CONFIG.product.unitPrice;
            if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-MX')} MXN`;

            if (checkoutBtn) {
                checkoutBtn.disabled = this.cartQty <= 0;
                checkoutBtn.style.opacity = this.cartQty <= 0 ? '0.5' : '1';
                checkoutBtn.style.cursor = this.cartQty <= 0 ? 'not-allowed' : 'pointer';
            }

            if (!container) return;
            container.textContent = '';

            if (this.cartQty <= 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'cart-empty-state';
                emptyDiv.textContent = 'Tu carrito está vacío. Agrega costales desde el catálogo.';
                container.appendChild(emptyDiv);
                return;
            }

            // Construcción segura de la tarjeta estilo Mercado Libre
            const itemCard = document.createElement('div');
            itemCard.className = 'cart-ml-item';

            const thumb = document.createElement('img');
            thumb.src = RADI_TERRA_CONFIG.product.image;
            thumb.alt = RADI_TERRA_CONFIG.product.presentation;
            thumb.className = 'cart-ml-thumb';

            const infoBox = document.createElement('div');
            infoBox.className = 'cart-ml-info';

            const title = document.createElement('div');
            title.className = 'cart-ml-title';
            title.textContent = RADI_TERRA_CONFIG.product.name;

            const sub = document.createElement('div');
            sub.className = 'cart-ml-sub';
            sub.textContent = `${RADI_TERRA_CONFIG.product.presentation} — $${RADI_TERRA_CONFIG.product.unitPrice} MXN c/u`;

            const controlsRow = document.createElement('div');
            controlsRow.className = 'cart-ml-controls';

            // Selector (- [ cantidad ] +)
            const stepper = document.createElement('div');
            stepper.className = 'cart-ml-stepper';

            const minusBtn = document.createElement('button');
            minusBtn.type = 'button';
            minusBtn.className = 'stepper-btn';
            minusBtn.setAttribute('aria-label', 'Quitar una unidad');
            minusBtn.textContent = '−';
            minusBtn.addEventListener('click', () => {
                this.cartQty = Math.max(0, this.cartQty - 1);
                this.updateCartUI();
            });

            const qtyField = document.createElement('input');
            qtyField.type = 'number';
            qtyField.className = 'stepper-input';
            qtyField.min = '0';
            qtyField.max = '500';
            qtyField.value = String(this.cartQty);
            qtyField.setAttribute('aria-label', 'Cantidad en el carrito');
            qtyField.addEventListener('change', () => {
                const parsed = parseInt(qtyField.value, 10);
                if (isNaN(parsed) || parsed <= 0) {
                    this.cartQty = 0;
                } else {
                    this.cartQty = Math.min(500, parsed);
                }
                this.updateCartUI();
            });

            const plusBtn = document.createElement('button');
            plusBtn.type = 'button';
            plusBtn.className = 'stepper-btn';
            plusBtn.setAttribute('aria-label', 'Agregar una unidad');
            plusBtn.textContent = '+';
            plusBtn.addEventListener('click', () => {
                this.cartQty = Math.min(500, this.cartQty + 1);
                this.updateCartUI();
            });

            stepper.appendChild(minusBtn);
            stepper.appendChild(qtyField);
            stepper.appendChild(plusBtn);

            // Botón para eliminar todo el producto de inmediato
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'cart-ml-remove';
            removeBtn.textContent = '🗑️ Eliminar';
            removeBtn.addEventListener('click', () => {
                this.cartQty = 0;
                this.updateCartUI();
            });

            controlsRow.appendChild(stepper);
            controlsRow.appendChild(removeBtn);

            infoBox.appendChild(title);
            infoBox.appendChild(sub);
            infoBox.appendChild(controlsRow);

            itemCard.appendChild(thumb);
            itemCard.appendChild(infoBox);
            container.appendChild(itemCard);
        }

        private initForms(): void {
            const wholesaleForm = document.getElementById('wholesale-form') as HTMLFormElement | null;
            const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
            const feedback = document.getElementById('form-feedback');
            const privacyBtn = document.getElementById('privacy-btn');

            wholesaleForm?.addEventListener('submit', (e: Event) => {
                e.preventDefault();
                const name = sanitizeInput((document.getElementById('ws-name') as HTMLInputElement).value);
                const phone = sanitizeInput((document.getElementById('ws-phone') as HTMLInputElement).value);
                const sacks = Math.max(5, Number((document.getElementById('ws-sacks') as HTMLInputElement).value || 5));
                const notes = sanitizeInput((document.getElementById('ws-notes') as HTMLTextAreaElement).value);

                if (!name || !phone) return;

                const message = `Hola RADI TERRA, solicito cotización de mayoreo.\nNombre/Empresa: ${name}\nTeléfono: ${phone}\nCantidad requerida: ${sacks} costales de 25 kg.\nNotas: ${notes || 'Ninguna'}`;
                this.openSecureWhatsApp(message);
            });

            contactForm?.addEventListener('submit', (e: Event) => {
                e.preventDefault();
                const name = sanitizeInput((document.getElementById('c-name') as HTMLInputElement).value);
                const email = sanitizeInput((document.getElementById('c-email') as HTMLInputElement).value);
                const phone = sanitizeInput((document.getElementById('c-phone') as HTMLInputElement).value);
                const msg = sanitizeInput((document.getElementById('c-message') as HTMLTextAreaElement).value);

                if (!name || !email || !msg) {
                    if (feedback) feedback.textContent = 'Por favor completa todos los campos requeridos.';
                    return;
                }

                if (feedback) {
                    feedback.textContent = 'Abriendo canal seguro de contacto con RADI TERRA...';
                }

                const whatsappText = `Contacto Web RADI TERRA\nNombre: ${name}\nCorreo: ${email}\nTel: ${phone}\nMensaje: ${msg}`;
                this.openSecureWhatsApp(whatsappText);
                contactForm.reset();
            });

            privacyBtn?.addEventListener('click', () => {
                window.alert(
                    'AVISO DE PRIVACIDAD Y POLÍTICAS COMERCIALES - RADI TERRA:\n\n' +
                    'Los datos proporcionados mediante nuestros formularios se utilizan exclusivamente para procesar cotizaciones, pedidos y brindar atención al cliente desde Comitán de Domínguez, Chiapas. Precio por costal de 25 kg: $405 MXN.'
                );
            });
        }

        private initTechSheetDownload(): void {
            const downloadBtn = document.getElementById('download-tech-sheet');
            downloadBtn?.addEventListener('click', () => {
                const content = [
                    '======================================================',
                    '        FICHA TÉCNICA DEL PRODUCTO - RADI TERRA       ',
                    '            "Un sustrato de excelencia"               ',
                    '======================================================',
                    '',
                    'NOMBRE COMERCIAL: RADI TERRA',
                    'MATERIA PRIMA: Residuos poscosecha del cultivo de hongos comestibles.',
                    '',
                    'CARACTERÍSTICAS FÍSICAS Y TÉCNICAS EVALUADAS:',
                    '- Materia orgánica: 89 %',
                    '- Espacio poroso total: 84 %',
                    '- Aireación: 33.8 %',
                    '- Retención de humedad: Hasta 90 %',
                    '',
                    'BENEFICIOS Y APLICACIONES:',
                    '- Alternativa para la producción de plántulas.',
                    '- Aprovechamiento de residuos del cultivo de hongos.',
                    '- Contribución a la economía circular.',
                    '- Potencial de incorporación en mezclas para sustratos agrícolas.',
                    '- Aplicaciones en viveros y jardinería.',
                    '',
                    'PRESENTACIÓN COMERCIAL:',
                    '- Costal de 25 kg | Precio: $405 MXN',
                    '',
                    'CONTACTO Y UBICACIÓN:',
                    '- Correo: raditerra32@gmail.com',
                    '- Teléfonos: 961-712-52-12 / 963-710-66-30',
                    '- Instagram: @radi_terra32',
                    '- Dirección: Col Chichima Sabinal 30093 Comitán de Dominguez Chiapas'
                ].join('\n');

                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Ficha_Tecnica_RADI_TERRA.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        private openSecureWhatsApp(message: string): void {
            const encoded = encodeURIComponent(message);
            const url = `https://wa.me/${RADI_TERRA_CONFIG.whatsappPrimary}?text=${encoded}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new RadiTerraApp();
    });
})();