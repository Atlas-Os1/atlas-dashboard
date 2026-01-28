/**
 * ElevenLabs Voice Integration
 * Provides text-to-speech and speech-to-text capabilities
 */

export interface VoiceCommand {
  text: string;
  intent: 'navigation' | 'query' | 'action' | 'unknown';
  action?: string;
  parameters?: Record<string, any>;
}

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  action?: {
    type: 'navigate' | 'display' | 'execute' | 'none';
    payload?: any;
  };
}

export class ElevenLabsClient {
  private apiKey: string;
  private voiceId: string = 'FlWKdYQxXAp6hL0ENfON'; // Default Flo voice

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(text: string): Promise<Blob | null> {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      return null;
    }
  }

  /**
   * Parse voice command and extract intent
   */
  parseCommand(text: string): VoiceCommand {
    const lowerText = text.toLowerCase().trim();

    // Navigation commands
    if (lowerText.includes('show') || lowerText.includes('go to') || lowerText.includes('navigate')) {
      if (lowerText.includes('overview') || lowerText.includes('home') || lowerText.includes('dashboard')) {
        return {
          text,
          intent: 'navigation',
          action: 'navigate',
          parameters: { path: '/' },
        };
      }
      if (lowerText.includes('analytics')) {
        return {
          text,
          intent: 'navigation',
          action: 'navigate',
          parameters: { path: '/analytics' },
        };
      }
      if (lowerText.includes('logs') || lowerText.includes('log')) {
        return {
          text,
          intent: 'navigation',
          action: 'navigate',
          parameters: { path: '/logs' },
        };
      }
      if (lowerText.includes('database') || lowerText.includes('storage')) {
        return {
          text,
          intent: 'navigation',
          action: 'navigate',
          parameters: { path: '/database' },
        };
      }
    }

    // Query commands
    if (lowerText.includes('what') || lowerText.includes('how many') || lowerText.includes('how much')) {
      if (lowerText.includes('error') || lowerText.includes('errors')) {
        return {
          text,
          intent: 'query',
          action: 'get_errors',
        };
      }
      if (lowerText.includes('health') || lowerText.includes('status')) {
        return {
          text,
          intent: 'query',
          action: 'get_health',
        };
      }
      if (lowerText.includes('projects')) {
        return {
          text,
          intent: 'query',
          action: 'get_projects',
        };
      }
    }

    // Action commands
    if (lowerText.includes('refresh') || lowerText.includes('reload') || lowerText.includes('update')) {
      return {
        text,
        intent: 'action',
        action: 'refresh_data',
      };
    }
    if (lowerText.includes('deploy')) {
      return {
        text,
        intent: 'action',
        action: 'deploy',
        parameters: { project: this.extractProjectName(lowerText) },
      };
    }

    return {
      text,
      intent: 'unknown',
    };
  }

  /**
   * Generate response for a command
   */
  async generateResponse(command: VoiceCommand, data?: any): Promise<VoiceResponse> {
    let responseText = '';
    let action: VoiceResponse['action'] = { type: 'none' };

    switch (command.action) {
      case 'navigate':
        responseText = `Navigating to ${command.parameters?.path === '/' ? 'overview' : command.parameters?.path.slice(1)}`;
        action = {
          type: 'navigate',
          payload: command.parameters?.path,
        };
        break;

      case 'get_health':
        if (data?.health) {
          responseText = `System health is ${data.health.overall}. ${data.health.activeProjects} projects are active with ${data.health.totalRequests} total requests. ${data.health.totalErrors > 0 ? `There are ${data.health.totalErrors} errors that need attention.` : 'No errors detected.'}`;
        } else {
          responseText = 'Unable to retrieve system health at this time.';
        }
        break;

      case 'get_errors':
        if (data?.errors !== undefined) {
          responseText = data.errors === 0 
            ? 'Great news! There are currently no errors in the system.'
            : `There are ${data.errors} errors across your projects that need attention.`;
        } else {
          responseText = 'Unable to retrieve error count at this time.';
        }
        break;

      case 'get_projects':
        if (data?.projectCount !== undefined) {
          responseText = `You have ${data.projectCount} active projects being monitored.`;
        } else {
          responseText = 'Unable to retrieve project count at this time.';
        }
        break;

      case 'refresh_data':
        responseText = 'Refreshing dashboard data now.';
        action = {
          type: 'execute',
          payload: { action: 'refresh' },
        };
        break;

      case 'deploy':
        if (command.parameters?.project) {
          responseText = `Initiating deployment for ${command.parameters.project}. Please confirm in the interface.`;
          action = {
            type: 'display',
            payload: { modal: 'deploy_confirm', project: command.parameters.project },
          };
        } else {
          responseText = 'Which project would you like to deploy?';
        }
        break;

      default:
        responseText = "I'm sorry, I didn't understand that command. You can ask me about system health, navigate to different pages, or refresh the data.";
    }

    // Generate audio for the response
    const audioBlob = await this.textToSpeech(responseText);
    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;

    return {
      text: responseText,
      audioUrl,
      action,
    };
  }

  /**
   * Extract project name from command text
   */
  private extractProjectName(text: string): string | undefined {
    // Simple extraction - could be improved with NLP
    const words = text.split(' ');
    const deployIndex = words.findIndex(w => w.includes('deploy'));
    if (deployIndex !== -1 && deployIndex < words.length - 1) {
      return words[deployIndex + 1];
    }
    return undefined;
  }
}

// Singleton instance
let elevenLabsInstance: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsInstance) {
    elevenLabsInstance = new ElevenLabsClient();
  }
  return elevenLabsInstance;
}
