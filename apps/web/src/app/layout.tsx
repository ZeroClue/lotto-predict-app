import type { Metadata } from 'next';
import { ChakraProvider } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'LottoPredict - Play Games & Earn Crypto',
  description: 'Play games and earn cryptocurrency rewards with lottery predictions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}