"use client";

import { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CircularProgress } from "@nextui-org/react";
import Dashboard from "@/components/Dashboard2";
import { Address, Koios, Lucid, LucidEvolution } from "@lucid-evolution/lucid";
import { Wallet } from "@/types/cardano";
import Link from 'next/link';
import { HoneycombPattern } from "@/components/ui/HoneycombPattern";

export default function Home() {
  const [lucid, setLucid] = useState<LucidEvolution>();
  const [address, setAddress] = useState<Address>("");
  const [result, setResult] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    Lucid(new Koios("/koios"), "Preview").then(setLucid).catch(handleError);
    
    const tempWallets: Wallet[] = [];
    for (const c in window.cardano) {
      const wallet = window.cardano[c];
      if (!wallet?.apiVersion || !wallet?.name) continue;
      tempWallets.push(wallet);
    }
    tempWallets.sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''));
    setWallets(tempWallets);
  }, []);

  const handleGenerateImage = async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    setResult(''); // Clear any previous error messages
    
    try {
      console.log('Making request to generate image...');
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const imageUrl = data.images?.[0]?.url || data.image || data.image_url;
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setResult(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  //#region helper functions
  function handleError(error: any) {
    const { info, message } = error;
    const errorMessage = `${message}`;

    try {
      // KoiosError:
      const a = errorMessage.indexOf("{", 1);
      const b = errorMessage.lastIndexOf("}", errorMessage.lastIndexOf("}") - 1) + 1;

      const rpc = errorMessage.slice(a, b);
      const jsonrpc = JSON.parse(rpc);

      const errorData = jsonrpc.error.data[0].error.data;
      try {
        const { validationError, traces } = errorData;

        setResult(`${validationError} Traces: ${traces.join(", ")}.`);
        console.error({ [validationError]: traces });
      } catch {
        const { reason } = errorData;

        setResult(`${reason}`);
        console.error(reason);
      }
    } catch {
      function toJSON(error: any) {
        try {
          const errorString = JSON.stringify(error);
          const errorJSON = JSON.parse(errorString);
          return errorJSON;
        } catch {
          return {};
        }
      }

      const { cause } = toJSON(error);
      const { failure } = cause ?? {};

      const failureCause = failure?.cause;

      let failureTrace: string | undefined;
      try {
        failureTrace = eval(failureCause).replaceAll(" Trace ", " \n ");
      } catch {
        failureTrace = undefined;
      }

      const failureInfo = failureCause?.info;
      const failureMessage = failureCause?.message;

      setResult(`${failureTrace ?? failureInfo ?? failureMessage ?? info ?? message ?? error}`);
      console.error(failureCause ?? { error });
    }
  }

  async function onConnectWallet(wallet: Wallet) {
    try {
      if (!lucid) throw "Uninitialized Lucid";
      const api = await wallet.enable();
      lucid.selectWallet.fromAPI(api);
      const address = await lucid.wallet().address();
      setAddress(address);
    } catch (error) {
      handleError(error);
    }
  }
  //#endregion

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #000000, #111111)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <HoneycombPattern position="left" baseColor="#3b82f6" />
      <HoneycombPattern position="right" baseColor="#9333ea" />

      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        zIndex: '1'
      }} />

      {/* Header */}
      <header style={{
        padding: '1.5rem 2rem',
        width: '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: '2'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AIKEN
              </span>
              <span style={{
                background: 'linear-gradient(to right, #3b82f6, #7dd3fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                MINT AI
              </span>
            </Link>
          </h1>

          {/* Wallet Connection */}
          {!address ? (
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered"
                  className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white"
                >
                  Connect Wallet
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Available Wallets">
                {wallets.map((wallet) => (
                  <DropdownItem 
                    key={wallet.name}
                    onPress={() => onConnectWallet(wallet)}
                  >
                    <div className="flex items-center gap-2">
                      {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />}
                      <span>{wallet.name}</span>
                    </div>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <span style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Connected: {address.slice(0, 8)}...{address.slice(-8)}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        width: '100%',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: '2'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          gap: '3rem',
          alignItems: 'flex-start'
        }}>
          {/* Left Side - Image Display */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{
              aspectRatio: '1',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated NFT" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '0.8rem',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
              ) : (
                <p style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem',
                  position: 'relative',
                  zIndex: '2'
                }}>
                  {isLoading ? 'Generating image...' : 'Your generated image will appear here'}
                </p>
              )}
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  right: '1rem',
                  zIndex: 3
                }}>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{
                        width: '30%',
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        borderRadius: '2px',
                        animation: 'loading 1.5s infinite',
                        position: 'relative'
                      }}
                    />
                  </div>
                  <style jsx>{`
                    @keyframes loading {
                      0% {
                        transform: translateX(-100%);
                      }
                      100% {
                        transform: translateX(400%);
                      }
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {/* Prompt Input Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(to right, #fff, rgba(255, 255, 255, 0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Create Your NFT</h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  position: 'relative'
                }}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your NFT idea..."
                    style={{
                      width: '100%',
                      padding: '1rem',
                      paddingRight: '3rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '1rem',
                      height: '275px',
                      resize: 'none'
                    }}
                  />
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isLoading}
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? '...' : '→'}
                  </button>
                </div>
              </div>
            </div>

            {/* Minting Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <button 
                onClick={() => setShowDashboard(true)}
                disabled={!lucid || !address}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: !lucid || !address 
                    ? 'rgba(147, 51, 234, 0.3)' 
                    : 'linear-gradient(to right, #9333ea, #6366f1)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: !lucid || !address ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {!lucid || !address ? 'Connect Wallet to Mint' : 'MINT as NFT'}
              </button>

              {/* Modal Overlay */}
              {showDashboard && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  {/* Modal Content */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    width: '90%',
                    maxWidth: '500px',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    wordBreak: 'break-word',
                    wordWrap: 'break-word'
                  }}>
                    <button
                      onClick={() => setShowDashboard(false)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      ×
                    </button>
                    {lucid && (
                      <Dashboard
                        lucid={lucid}
                        address={address}
                        setActionResult={setResult}
                        onError={handleError}
                        imageUrl={generatedImage}
                      />
                    )}
                    {result && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        {result}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}