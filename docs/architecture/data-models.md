# Data Models

## User

**Purpose:** Represents a user of the Lotto-NFT application, including their authentication credentials and profile information.

**Key Attributes:**
- `id`: `string` - Unique identifier for the user.
- `email`: `string` - User's email address (unique, used for login).
- `passwordHash`: `string` - Hashed password for security (optional if using social login).
- `username`: `string` - User's display name (optional, can be unique).
- `createdAt`: `Date` - Timestamp of user registration.
- `updatedAt`: `Date` - Timestamp of last profile update.
- `walletAddress`: `string` - Public address for their crypto wallet (optional, for real crypto integration).
- `provider`: `'email' | 'google' | 'facebook' | 'github'` - The authentication provider used (e.g., 'google', 'email').
- `providerId`: `string` - The unique ID from the social provider (if applicable).

### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  passwordHash?: string; // Optional if using social login
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  walletAddress?: string; // For real crypto integration
  provider?: 'email' | 'google' | 'facebook' | 'github';
  providerId?: string;
}
```

### Relationships

- A `User` has many `NFTs`.
- A `User` has a `CryptoBalance`.

## NFT

**Purpose:** Represents a non-fungible token (NFT) collected by a user, including its properties, ownership details, and intrinsic value.

**Key Attributes:**
- `id`: `string` - Unique identifier for the NFT (e.g., blockchain token ID).
- `ownerId`: `string` - ID of the `User` who owns this NFT.
- `name`: `string` - Display name of the NFT (e.g., "Lucky Charm #001").
- `description`: `string` - A brief description of the NFT.
- `imageUrl`: `string` - URL to the NFT's image asset (stored in Supabase Storage).
- `rarity`: `string` - Rarity level (e.g., "Common", "Rare", "Legendary").
- `mintDate`: `Date` - Timestamp when the NFT was minted.
- `dynamicProperties`: `Record<string, any>` - JSON object to store properties that can change (e.g., `color`, `border`, `background` based on lottery outcomes).
- `isFeatured`: `boolean` - Flag indicating if the NFT is featured on the user's profile.
- `baseValue`: `number` - The intrinsic value of the NFT in the custom cryptocurrency (for MVP).

### TypeScript Interface

```typescript
interface NFT {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  imageUrl: string;
  rarity: string;
  mintDate: Date;
  dynamicProperties?: Record<string, any>; // Properties that can change
  isFeatured: boolean;
  baseValue: number; // Intrinsic value in custom cryptocurrency
}
```

### Relationships

- An `NFT` belongs to one `User`.

## CryptoBalance

**Purpose:** Stores the current balance of the custom cryptocurrency for each user.

**Key Attributes:**
- `userId`: `string` - ID of the `User` who owns this balance (foreign key).
- `balance`: `number` - The current amount of custom cryptocurrency the user possesses.
- `updatedAt`: `Date` - Timestamp of the last balance update.

### TypeScript Interface

```typescript
interface CryptoBalance {
  userId: string;
  balance: number;
  updatedAt: Date;
}
```

### Relationships

- A `CryptoBalance` belongs to one `User`.
- A `User` has one `CryptoBalance`.

## Game

**Purpose:** Defines the properties of an in-app game that users can play.

**Key Attributes:**
- `id`: `string` - Unique identifier for the game.
- `name`: `string` - Display name of the game (e.g., "Lucky Number Puzzle").
- `description`: `string` - A brief description of the game.
- `rewardAmount`: `number` - The amount of custom cryptocurrency awarded for completing the game.
- `nftAwardThreshold`: `number` - The number of times a user must complete this game to earn an NFT (if applicable).
- `isActive`: `boolean` - Flag indicating if the game is currently active and playable.
- `imageUrl`: `string` - URL to the game's icon or promotional image.

### TypeScript Interface

```typescript
interface Game {
  id: string;
  name: string;
  description?: string;
  rewardAmount: number;
  nftAwardThreshold?: number; // e.g., complete 5 times for an NFT
  isActive: boolean;
  imageUrl?: string;
}
```

### Relationships

- A `Game` can be played by many `Users`. (This implies a many-to-many relationship, likely managed through a `UserGameActivity` or `GameCompletion` model later, but for the MVP, we focus on the game definition itself).

## LotteryDraw

**Purpose:** Stores the results of past lottery draws, serving as the data source for the prediction engine.

**Key Attributes:**
- `id`: `string` - Unique identifier for the lottery draw (e.g., `[LotteryName]-[DrawDate]`).
- `lotteryName`: `string` - The name of the lottery (e.g., "Powerball", "Mega Millions").
- `drawDate`: `Date` - The date and time of the lottery draw.
- `winningNumbers`: `number[]` - An array of the winning numbers for the draw.
- `bonusNumber`: `number` - The bonus/power/mega ball number (if applicable).
- `jackpotAmount`: `number` - The jackpot amount for this draw (optional).
- `sourceUrl`: `string` - URL to the official results page (for verification).

### TypeScript Interface

```typescript
interface LotteryDraw {
  id: string;
  lotteryName: string;
  drawDate: Date;
  winningNumbers: number[];
  bonusNumber?: number;
  jackpotAmount?: number;
  sourceUrl?: string;
}
```

### Relationships

- None directly with other current models, but it's a foundational data source for the `PredictionEngine` functionality.
