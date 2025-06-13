'use client';

import React from 'react';
import { useReadContract } from 'wagmi';
import { abi } from '../../public/abi';
import SockybaraSVG from './SockybaraSVG';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function ViewSockybara() {
  const [mounted, setMounted] = React.useState(false);
  const [tokenId, setTokenId] = React.useState('');
  const [isCopying, setIsCopying] = React.useState(false);
  const [inputError, setInputError] = React.useState('');
  const svgRef = React.useRef<HTMLDivElement>(null);

  const { data: traits, isError, isLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getTraits',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== '' && !inputError,
    },
  });

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== '' && !inputError,
    },
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const convertSvgToPng = async (svgElement: SVGElement): Promise<string> => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 400;
    canvas.height = 400;
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  };

  const handleShare = async () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const pngData = await convertSvgToPng(svgElement);
      
      // Check if native sharing is available (mobile devices)
      if (navigator.share) {
        const blob = await fetch(pngData).then(r => r.blob());
        const file = new File([blob], `sockybara-${tokenId}.png`, { type: 'image/png' });
        
        try {
          await navigator.share({
            files: [file],
            title: `Sockybara #${tokenId}`,
            text: `Check out my Sockybara #${tokenId}!`
          });
        } catch (err) {
          // If sharing fails, fall back to copy
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setIsCopying(true);
          setTimeout(() => setIsCopying(false), 2000);
        }
      } else {
        // Desktop fallback - copy to clipboard
        const blob = await fetch(pngData).then(r => r.blob());
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing/copying image:', error);
      setIsCopying(false);
    }
  };

  const handleDownload = async () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      const pngData = await convertSvgToPng(svgElement);
      
      // Check if native sharing is available (mobile devices)
      if (navigator.share) {
        const blob = await fetch(pngData).then(r => r.blob());
        const file = new File([blob], `sockybara-${tokenId}.png`, { type: 'image/png' });
        
        try {
          await navigator.share({
            files: [file],
            title: `Sockybara #${tokenId}`,
            text: `Check out my Sockybara #${tokenId}!`
          });
        } catch (err) {
          // If sharing fails, fall back to download
          const link = document.createElement('a');
          link.download = `sockybara-${tokenId}.png`;
          link.href = pngData;
          link.click();
        }
      } else {
        // Desktop fallback - direct download
        const link = document.createElement('a');
        link.download = `sockybara-${tokenId}.png`;
        link.href = pngData;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">View Sockybara Traits</h1>
      
      <div className="mb-6">
        <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
          Token ID
        </label>
        <input
          name="tokenId"
          type="number"
          min="0"
          max="247"
          placeholder="Enter token ID to view traits"
          value={tokenId}
          onChange={(e) => {
            const value = e.target.value;
            setTokenId(value);
            if (value === '') {
              setInputError('');
            } else {
              const num = parseInt(value);
              setInputError(num >= 0 && num <= 247 ? '' : 'Token ID must be between 0 and 247');
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputError && (
          <p className="mt-1 text-sm text-red-600">{inputError}</p>
        )}
      </div>

      {isLoading && tokenId && (
        <p className="text-gray-600">Loading traits...</p>
      )}

      {isError && tokenId && (
        <p className="text-red-600">Error loading traits</p>
      )}

      {traits && (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div ref={svgRef}>
              <SockybaraSVG
                frontLeftSockColor={`#${traits[0]}`}
                frontRightSockColor={`#${traits[1]}`}
                backLeftSockColor={`#${traits[2]}`}
                backRightSockColor={`#${traits[3]}`}
                leftEyeColor={`#${traits[4]}`}
                rightEyeColor={`#${traits[5]}`}
                leftEarColor={`#${traits[6]}`}
                rightEarColor={`#${traits[7]}`}
                noseColor={`#${traits[8]}`}
                width={400}
                height={400}
              />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {typeof navigator.share === 'function' ? (
                <button
                  onClick={handleShare}
                  disabled={isCopying}
                  className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                >
                  Share
                </button>
              ) : (
                <>
                  <button
                    onClick={handleShare}
                    disabled={isCopying}
                    className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isCopying ? 'Copied!' : 'Copy PNG'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                  >
                    Download PNG
                  </button>
                </>
              )}
            </div>
          </div>

          {owner && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Owner</p>
              <p className="font-mono text-sm break-all">{owner}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Front Left Sock</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[0]}` }} />
                <p className="text-sm font-mono">{traits[0]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Front Right Sock</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[1]}` }} />
                <p className="text-sm font-mono">{traits[1]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Back Left Sock</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[2]}` }} />
                <p className="text-sm font-mono">{traits[2]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Back Right Sock</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[3]}` }} />
                <p className="text-sm font-mono">{traits[3]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Left Eye</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[4]}` }} />
                <p className="text-sm font-mono">{traits[4]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Right Eye</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[5]}` }} />
                <p className="text-sm font-mono">{traits[5]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Left Ear</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[6]}` }} />
                <p className="text-sm font-mono">{traits[6]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Right Ear</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[7]}` }} />
                <p className="text-sm font-mono">{traits[7]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">Nose</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: `#${traits[8]}` }} />
                <p className="text-sm font-mono">{traits[8]}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 