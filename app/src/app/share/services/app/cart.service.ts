import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ItemCartModel } from '../../models/ItemCartModel';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  //Noticar acciones
  private notiService = inject(NotificationService);
  /** 
   * Signal principal con el estado del carrito
   * Se inicializa leyendo localStorage
   */
  private cart = signal<ItemCartModel[]>(this.loadCartFromStorage());

  /**
   * Observable reactivo: lista completa del carrito
   */
  readonly itemsCart = computed(() => this.cart());

  /** Cantidad total de artículos */
  readonly qtyItems = computed(() =>
    this.cart().reduce((sum, item) => sum + item.cantidad, 0)
  );

  /** Total del carrito */
  readonly total = computed(() =>
    this.cart().reduce((total, item) => total + item.subtotal, 0)
  );

  constructor() {
    /**
     * Guardar automáticamente cambios en localStorage
     * Reemplaza cualquier `saveCart()` manual
     */
    effect(() => {
      localStorage.setItem('orden', JSON.stringify(this.cart()));
    });
  }

  /** Leer carrito inicial desde localStorage */
  private loadCartFromStorage(): ItemCartModel[] {
    try {
      const data = localStorage.getItem('orden');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ---- MÉTODOS DEL CARRITO ---- //

  /** 
   * Agrega o actualiza un producto en el carrito 
   * Si `quantity` existe, establece valor; si no, incrementa en 1
   */



  /** Vaciar todo el carrito */
  deleteCart(): void {
    this.cart.set([]);
  }
}
