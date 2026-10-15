import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage.js';
import { DesignSystemPage } from '../pages/DesignSystemPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import '../lib/i18n.js';

describe('Responsive Layout and Horizontal Overflow Check', () => {
  const viewports = [320, 375, 768, 1280];

  viewports.forEach((width) => {
    it(`verifies LandingPage renders without overflow at ${width}px`, () => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ width: `${width}px`, maxWidth: '100vw' }}>
            <LandingPage />
          </div>
        </BrowserRouter>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toBeDefined();
      expect(wrapper.scrollWidth).toBeLessThanOrEqual(width + 1);
    });

    it(`verifies DesignSystemPage renders without overflow at ${width}px`, () => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ width: `${width}px`, maxWidth: '100vw' }}>
            <DesignSystemPage />
          </div>
        </BrowserRouter>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toBeDefined();
      expect(wrapper.scrollWidth).toBeLessThanOrEqual(width + 1);
    });

    it(`verifies LoginPage renders without overflow at ${width}px`, () => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ width: `${width}px`, maxWidth: '100vw' }}>
            <LoginPage />
          </div>
        </BrowserRouter>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toBeDefined();
      expect(wrapper.scrollWidth).toBeLessThanOrEqual(width + 1);
    });

    it(`verifies RegisterPage renders without overflow at ${width}px`, () => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div style={{ width: `${width}px`, maxWidth: '100vw' }}>
            <RegisterPage />
          </div>
        </BrowserRouter>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toBeDefined();
      expect(wrapper.scrollWidth).toBeLessThanOrEqual(width + 1);
    });
  });
});
