import { seaportAbi } from 'abitype/abis'
import { assertType, expectTypeOf, test } from 'vitest'

import { type Address, parseAbi } from 'abitype'
import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { walletClientWithAccount } from '~test/src/utils.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { custom } from '../../clients/transports/custom.js'
import { type WriteContractParameters, writeContract } from './writeContract.js'

test('WriteContractParameters', async () => {
  type Result = WriteContractParameters<typeof seaportAbi, 'cancel'>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    | 'cancel'
    | 'fulfillAdvancedOrder'
    | 'fulfillAvailableAdvancedOrders'
    | 'fulfillAvailableOrders'
    | 'fulfillBasicOrder'
    | 'fulfillBasicOrder_efficient_6GL6yc'
    | 'fulfillOrder'
    | 'incrementCounter'
    | 'matchAdvancedOrders'
    | 'matchOrders'
    | 'validate'
  >()

  const address = '0x' as const
  assertType<WriteContractParameters<typeof seaportAbi, 'cancel'>>({
    abi: seaportAbi,
    account: address,
    address,
    functionName: 'cancel',
    // ^?
    chain: null,
    args: [
      [
        {
          offerer: address,
          zone: address,
          offer: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
            },
          ],
          consideration: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
              recipient: address,
            },
          ],
          counter: 1n,
          orderType: 1,
          startTime: 1n,
          endTime: 1n,
          salt: 1n,
          conduitKey: address,
          zoneHash: address,
        },
      ],
    ],
  })
})

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('infers args', () => {
  const client = createWalletClient({
    account: accounts[0].address,
    chain: mainnet,
    transport: custom(window.ethereum!),
  })
  const abi = parseAbi([
    'function foo(address) payable returns (int8)',
    'function bar(address, uint256) returns (int8)',
  ])

  type Result1 = WriteContractParameters<typeof abi, 'foo'>
  type Result2 = Parameters<
    typeof writeContract<
      (typeof client)['chain'],
      (typeof client)['account'],
      typeof abi,
      'foo',
      readonly [Address],
      (typeof client)['chain']
    >
  >[1]
  expectTypeOf<Result1['functionName']>().toEqualTypeOf<'foo' | 'bar'>()
  expectTypeOf<Result2['functionName']>().toEqualTypeOf<'foo' | 'bar'>()

  writeContract(client, {
    address: '0x',
    abi,
    functionName: 'foo',
    args: ['0x'],
  })
})

test('with and without chain', () => {
  const client = createWalletClient({
    account: accounts[0].address,
    transport: custom(window.ethereum!),
  })
  // @ts-expect-error `chain` is required
  writeContract(client, { ...args })
  writeContract(walletClientWithAccount, {
    ...args,
    chain: undefined,
  })
})

test('type: legacy', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('type: eip1559', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('type: eip2930', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('args: value', () => {
  // payable function
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
    value: 5n,
  })

  // payable function (undefined)
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
  })

  // nonpayable function
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'approve',
    // @ts-expect-error
    value: 5n,
  })
})
