"use client";

import { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Button } from "@heroui/button";
import { CircularProgress } from "@heroui/progress";
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

  return (
    <div className="min-h-screen w-full m-0 p-0 absolute inset-0 bg-gradient-to-br from-black to-gray-900 text-white flex flex-col overflow-hidden">
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
      <header className="p-6 w-full border-b border-white/10 backdrop-blur relative z-10">
        <div className="flex items-center justify-between gap-2 w-full">
          <h1 className="text-3xl font-bold m-0 flex gap-2 items-center">
            <Link href="/" className="no-underline flex gap-2 items-center">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                AIKEN
              </span>
              <span className="bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
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
              <DropdownMenu>
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
            <span className="text-sm text-white/70">
              Connected: {address.slice(0, 8)}...{address.slice(-8)}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full p-8 flex justify-center items-start relative z-10">
        <div className="w-full max-w-7xl flex gap-12 items-start">
          {/* Left Side - Image Display */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-[558px] bg-white/5 rounded-2xl border border-white/10 flex justify-center items-center p-4 relative overflow-hidden shadow-2xl">
              {isLoading && (
                <CircularProgress
                  size="lg"
                  color="primary"
                  aria-label="Loading..."
                />
              )}
              {generatedImage && !isLoading && (
                <img 
                  src={generatedImage} 
                  alt="Generated NFT" 
                  className="w-full h-full object-contain rounded-xl"
                />
              )}
              {!generatedImage && !isLoading && (
                <p className="text-white/50 text-sm">
                  Your generated image will appear here
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Prompt Input Section */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Create Your NFT
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your NFT idea..."
                    className="w-full p-4 pr-12 bg-black/20 border border-white/10 rounded-lg text-white text-base h-[275px] resize-none"
                  />
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isLoading}
                    className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 border-none rounded-lg p-2 text-white cursor-pointer flex items-center justify-center w-8 h-8 transition-transform hover:scale-105 shadow-blue-500/30 disabled:opacity-70"
                  >
                    {isLoading ? '...' : '→'}
                  </button>
                </div>
              </div>
            </div>

            {/* Minting Section */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
              <button 
                onClick={() => setShowDashboard(true)}
                disabled={!lucid || !address}
                className={`w-full p-4 ${
                  !lucid || !address 
                    ? 'bg-purple-600/30' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                } border-none rounded-lg text-white text-base font-semibold cursor-pointer transition-all hover:transform hover:scale-[1.02] hover:shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:hover:transform-none`}
              >
                {!lucid || !address ? 'Connect Wallet to Mint' : 'MINT as NFT'}
              </button>

              {/* Modal Overlay */}
              {showDashboard && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                  {/* Modal Content */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl w-[90%] max-w-[500px] relative border border-white/10 shadow-2xl overflow-x-hidden overflow-y-auto break-words">
                    <button
                      onClick={() => setShowDashboard(false)}
                      className="absolute top-4 right-4 bg-none border-none text-white text-2xl cursor-pointer p-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/10"
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
                      <div className="mt-4 p-4 bg-white/5 rounded-lg text-sm text-white/80">
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