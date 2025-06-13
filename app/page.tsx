import ViewSockybara from './components/ViewSockybara';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Sockybara</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? (
          <a 
            href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
          </a>
        ) : (
          <p>hi, did you forget to
            <code className="bg-gray-100 px-2 py-1 rounded">
              cp .env.example .env
            </code>
          </p>
        )}
      </div>
      <ViewSockybara />
    </div>
  );
}
