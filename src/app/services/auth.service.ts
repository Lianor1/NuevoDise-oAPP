import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static instance: AuthService;
  private supabase: SupabaseClient;
  private returnUrl: string | null = null;
  private authState = new BehaviorSubject<boolean>(false);

  private constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    // Verificar estado inicial
    this.checkAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async checkAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.authState.next(!!session);
    return !!session;
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string {
    return this.returnUrl || '/home';
  }

  clearReturnUrl() {
    this.returnUrl = null;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.authState.next(false);
  }

  async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (session) {
        this.authState.next(true);
      } else {
        this.authState.next(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      this.authState.next(false);
    }
  }
} 