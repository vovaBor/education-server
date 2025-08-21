import { Injectable } from '@nestjs/common';
import axios from 'axios';

// Simple interfaces for better typing
export interface CompanyEnrichmentResult {
  companyName: string;
  githubUrl?: string;
  description?: string;
  website?: string;
  followers?: string;
  verified: boolean;
  error?: string;
}

export interface ContactEnrichmentResult {
  email: string;
  emailType: string;
  domain: string;
  isBusinessEmail: boolean;
}

@Injectable()
export class LeadEnrichmentService {
  
  /**
   * Enrich company data from GitHub
   */
  async enrichCompanyData(companyName: string): Promise<CompanyEnrichmentResult> {
    if (!companyName) return { companyName: '', verified: false };

    try {
      const searchQuery = companyName.toLowerCase().replace(/\s+/g, '');
      const searchUrl = `https://api.github.com/search/users?q=${searchQuery}+type:org&per_page=1`;
      
      const response = await axios.get(searchUrl, { 
        timeout: 5000,
        headers: process.env.GITHUB_TOKEN ? {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        } : {}
      });

      if (response.data.items && response.data.items.length > 0) {
        const org = response.data.items[0];
        return {
          companyName,
          githubUrl: org.html_url,
          description: org.description,
          website: org.blog,
          followers: org.followers_url ? 'Available' : undefined,
          verified: org.type === 'Organization',
        };
      }

      return { companyName, verified: false };
    } catch (error) {
      return { companyName, error: 'Failed to fetch company data', verified: false };
    }
  }

  /**
   * Enrich contact data from email
   */
  async enrichContactData(email: string): Promise<ContactEnrichmentResult> {
    const domain = email.split('@')[1];
    const emailType = this.determineEmailType(domain);
    
    return {
      email,
      emailType,
      domain,
      isBusinessEmail: emailType === 'business',
    };
  }

  private determineEmailType(domain: string): string {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return personalDomains.includes(domain.toLowerCase()) ? 'personal' : 'business';
  }
} 
