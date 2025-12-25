/**
 * Support Configuration
 * Centralized configuration for support contact details and FAQs
 * Update this file to change support information across the application
 */

export const SUPPORT_CONFIG = {
  // Contact Information
  contact: {
    phones: [
      {
        number: '+91 84592 11850',
        display: '+91 84592 11850',
        href: 'tel:+918459211850'
      },
      {
        number: '+91 91689 98942',
        display: '+91 91689 98942',
        href: 'tel:+919168998942'
      }
    ],
    email: {
      address: 'piyushmchotiya@gmail.com',
      display: 'piyushmchotiya@gmail.com',
      href: 'mailto:piyushmchotiya@gmail.com'
    }
  },

  // Support Hours
  hours: {
    availability: '6:00 PM - 10:00 PM & 7:00 AM - 10:00 AM (IST)',
    days: 'Monday to Saturday',
    responseTime: 'within 24 hours',
    fullDescription: 'Our support team is available Monday to Saturday from 6:00 PM to 10:00 PM and 7:00 AM to 10:00 AM (IST).',
    urgentNote: 'For urgent matters during support hours, we recommend calling for the fastest response.'
  },

  // FAQs
  faqs: [
    {
      question: 'When can I expect a response to my query?',
      answer: 'Our support team is available from 6:00 PM to 10:00 PM and 7:00 AM to 10:00 AM (IST). We typically respond within 24 hours.'
    },
    {
      question: 'How do I update my vendor profile?',
      answer: 'Navigate to the Profile section from the sidebar. You can update your business information, contact details, service areas, and upload photos. Make sure to save your changes before leaving the page.'
    },
    {
      question: 'How do I manage my bookings?',
      answer: 'Go to the Orders section to view all your bookings. You can see upcoming events, confirm orders, and update order status. Use the Calendar view to see your schedule at a glance.'
    },
    {
      question: 'How do I respond to customer leads?',
      answer: 'Check the Leads section regularly for new inquiries. You can respond directly to customers, send quotes, and convert leads into confirmed bookings. Quick responses improve your chances of winning business!'
    },
    {
      question: 'What should I do if I encounter a technical issue?',
      answer: 'Contact us immediately via phone or email (details below). Describe the issue you\'re facing, and our team will assist you promptly. For urgent matters during business hours, calling is the fastest way to get help.'
    },
    {
      question: 'How do I add or edit my service listings?',
      answer: 'Visit the Listings section to create new packages or items. You can set pricing, add descriptions, upload images, and specify what\'s included. Make your listings detailed to attract more customers!'
    }
  ]
} as const;
