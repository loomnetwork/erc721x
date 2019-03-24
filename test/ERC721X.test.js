const { assertEventVar,
    expectThrow,
} = require('./helpers')
const { BN } = web3.utils
const bnChai = require('bn-chai')

require('chai')
    .use(require('chai-as-promised'))
    .use(bnChai(BN))
    .should()

const Card = artifacts.require('Card')

const safeTransferFromNoDataFT = async function(token, from, to, uid, amount, opts) {
    return token.methods['safeTransferFrom(address,address,uint256,uint256)'](from, to, uid, amount, opts)
}

const safeTransferFromNoDataNFT = async function(token, from, to, uid, opts) {
    return token.methods['safeTransferFrom(address,address,uint256)'](from, to, uid, opts)
}

const baseTokenURI = "https://rinkeby.loom.games/erc721/zmb/"

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

contract('Card', accounts => {
    let card
    const  [ alice, bob, carlos ] = accounts;

    beforeEach(async () => {
        card = await Card.new(baseTokenURI)
    });

    it('Should ZBGCard be deployed', async () => {
        card.address.should.not.be.null

        const name = await card.name.call()
        name.should.be.equal('Card')

        const symbol = await card.symbol.call()
        symbol.should.be.equal('CRD')
    })

    it('Should get the correct supply when minting both NFTs and FTs', async () => {
        // Supply is the total amount of UNIQUE cards.
        for (let i = 0; i < 10; i+=2) {
            await card.mint(i, accounts[0], 2)
            await card.mint(i+1, accounts[0])
        }
        const supply = await card.totalSupply.call()
        assert.equal(supply, 10)

    })


    it('Should return correct token uri for multiple FT', async () => {
        for (let i = 0; i< 100; i++) {
            await card.mint(i, accounts[0], 2)
            const cardUri = await card.tokenURI.call(i)
            assert.equal(cardUri, `${baseTokenURI}${i}.json`)
        }
    })

    it('Should return correct token uri for multiple NFT', async () => {
        for (let i = 0; i< 100; i++) {
            await card.mint(i, accounts[0])
            const cardUri = await card.tokenURI.call(i)
            assert.equal(cardUri, `${baseTokenURI}${i}.json`)
        }
    })

    it('Should return correct token uri for 6-digit NFT', async () => {
        const uid = 987145
        await card.mint(uid, accounts[0])
        const cardUri = await card.tokenURI.call(uid)
        assert.equal(cardUri, `${baseTokenURI}${uid}.json`)
    })

    it('Should be able to mint a fungible token', async () => {
        const uid = 0
        const amount = 5;
        await card.mint(uid, accounts[0], amount)

        const balanceOf1 = await card.balanceOf.call(accounts[0], uid)
        balanceOf1.should.be.eq.BN(new BN(5))

        const balanceOf2 = await card.balanceOf.call(accounts[0])
        balanceOf2.should.be.eq.BN(new BN(1))

        await card.mint(uid, accounts[0], amount)
        const newBalanceOf1 = await card.balanceOf.call(accounts[0], uid)
        newBalanceOf1.should.be.eq.BN(new BN(10))

        const newBalanceOf2 = await card.balanceOf.call(accounts[0])
        newBalanceOf2.should.be.eq.BN(balanceOf2)
    })

    it('Should be able to mint a non-fungible token', async () => {
        const uid = 0
        await card.mint(uid, accounts[0])

        const balanceOf1 = await card.balanceOf.call(accounts[0], uid)
        balanceOf1.should.be.eq.BN(new BN(1))

        const balanceOf2 = await card.balanceOf.call(accounts[0])
        balanceOf2.should.be.eq.BN(new BN(1))

        const ownerOf = await card.ownerOf.call(uid)
        ownerOf.should.be.eq.BN(accounts[0])
    })

    it('Should be impossible to mint NFT tokens with duplicate tokenId', async () => {
        const uid = 0;
        await card.mint(uid, alice);
        const supplyPostMint = await card.totalSupply()
        await expectThrow(card.mint(uid, alice))
        const supplyPostSecondMint = await card.totalSupply()
        supplyPostMint.should.be.eq.BN(supplyPostSecondMint)
    })

    it('Should be impossible to mint NFT tokens with the same tokenId as an existing FT tokenId', async () => {
        const uid = 0;
        await card.mint(uid, alice, 5);
        const supplyPostMint = await card.totalSupply()
        await expectThrow(card.mint(uid, alice))
        const supplyPostSecondMint = await card.totalSupply()
        supplyPostMint.should.be.eq.BN(supplyPostSecondMint)
    })

    it('Should be impossible to mint FT tokens with the same tokenId as an existing NFT tokenId', async () => {
        const uid = 0;
        await card.mint(uid, alice);
        const supplyPostMint = await card.totalSupply()
        await expectThrow(card.mint(uid, alice, 5))
        const supplyPostSecondMint = await card.totalSupply()
        supplyPostMint.should.be.eq.BN(supplyPostSecondMint)
    })

    it('Should be impossible to mint NFT tokens more than once even when owner is the contract itself', async () => {
        const uid = 0;
        await card.mint(uid, card.address);
        const supplyPostMint = await card.totalSupply()
        await expectThrow(card.mint(uid, card.address, 3))
        const supplyPostSecondMint = await card.totalSupply()
        supplyPostMint.should.be.eq.BN(supplyPostSecondMint)
    })

    it('a FT token should not have an owner', async () => {
        const uid = 0;
        await card.mint(uid, alice, 10);
        await expectThrow(card.ownerOf(uid));
    })

    it('Should be impossible for a FT token to be transferred with NFT transfer', async () => {
        const uid = 0;
        await card.mint(uid, alice, 10);
        await expectThrow(card.transferFrom(alice, bob, uid));
        await expectThrow(card.ownerOf(uid));
    })

    it('Should be able to transfer a non fungible token', async () => {
        const uid = 0
        await card.mint(uid, alice)

        const balanceOf1 = await card.balanceOf.call(alice, uid)
        balanceOf1.should.be.eq.BN(new BN(1))

        const balanceOf2 = await card.balanceOf.call(alice)
        balanceOf2.should.be.eq.BN(new BN(1))

        const tx2 = await safeTransferFromNoDataNFT(card, alice, bob, uid, {from: alice})

        const ownerOf2 = await card.ownerOf(uid);
        assert.equal(ownerOf2, bob)

        assertEventVar(tx2, 'Transfer', 'from', alice)
        assertEventVar(tx2, 'Transfer', 'to', bob)
        assertEventVar(tx2, 'Transfer', 'tokenId', uid)

        const balanceOf3 = await card.balanceOf.call(bob)
        balanceOf3.should.be.eq.BN(new BN(1))
    })

    it('Should Alice transfer a fungible token', async () => {
        const uid = 0
        const amount = 3
        await card.mint(uid, alice, amount)

        const aliceCardsBefore = await card.balanceOf(alice)
        assert.equal(aliceCardsBefore, 1)

        const bobCardsBefore = await card.balanceOf(bob)
        assert.equal(bobCardsBefore, 0)

        const tx = await safeTransferFromNoDataFT(card, alice, bob, uid, amount, {from: alice})

        assertEventVar(tx, 'TransferWithQuantity', 'from', alice)
        assertEventVar(tx, 'TransferWithQuantity', 'to', bob)
        assertEventVar(tx, 'TransferWithQuantity', 'tokenId', uid)
        assertEventVar(tx, 'TransferWithQuantity', 'quantity', amount)

        const aliceCardsAfter = await card.balanceOf(alice)
        assert.equal(aliceCardsAfter, 0)
        const bobCardsAfter = await card.balanceOf(bob)
        assert.equal(bobCardsAfter, 1)
    })

    it('Should Alice authorize transfer from Bob', async () => {
        const uid = 0;
        const amount = 5
        await card.mint(uid, alice, amount)
        let tx = await card.setApprovalForAll(bob, true, {from: alice})

        assertEventVar(tx, 'ApprovalForAll', 'owner', alice)
        assertEventVar(tx, 'ApprovalForAll', 'operator', bob)
        assertEventVar(tx, 'ApprovalForAll', 'approved', true)

        tx = await safeTransferFromNoDataFT(card, alice, bob, uid, amount, {from: bob})

        assertEventVar(tx, 'TransferWithQuantity', 'from', alice)
        assertEventVar(tx, 'TransferWithQuantity', 'to', bob)
        assertEventVar(tx, 'TransferWithQuantity', 'tokenId', uid)
        assertEventVar(tx, 'TransferWithQuantity', 'quantity', amount)
    })

    it('Should Carlos not be authorized to spend', async () => {
        const uid = 0;
        const amount = 5
        let tx = await card.setApprovalForAll(bob, true, {from: alice})

        assertEventVar(tx, 'ApprovalForAll', 'owner', alice)
        assertEventVar(tx, 'ApprovalForAll', 'operator', bob)
        assertEventVar(tx, 'ApprovalForAll', 'approved', true)

        await expectThrow(safeTransferFromNoDataFT(card, alice, bob, uid, amount, {from: carlos}))
    })

    it('Should get the correct number of coins owned by a user', async () => {
        let numTokens = await card.totalSupply();
        let balanceOf = await card.balanceOf(alice);
        balanceOf.should.be.eq.BN(new BN(0));

        await card.mint(1000, alice, 100);
        let numTokens1 = await card.totalSupply();

        numTokens1.should.be.eq.BN(numTokens.add(new BN(1)));

        await card.mint(11, bob, 5);
        let numTokens2 = await card.totalSupply();
        numTokens2.should.be.eq.BN(numTokens1.add(new BN(1)));

        await card.mint(12, alice, 2);
        let numTokens3 = await card.totalSupply();
        numTokens3.should.be.eq.BN(numTokens2.add(new BN(1)));

        await card.mint(13, alice);
        let numTokens4 = await card.totalSupply();
        numTokens4.should.be.eq.BN(numTokens3.add(new BN(1)));
        balanceOf = await card.balanceOf(alice);
        balanceOf.should.be.eq.BN(new BN(3));

        const tokensOwned = await card.tokensOwned(alice);
        const indexes = tokensOwned[0];
        const balances = tokensOwned[1];

        indexes[0].should.be.eq.BN(new BN(1000));
        indexes[1].should.be.eq.BN(new BN(12));
        indexes[2].should.be.eq.BN(new BN(13));

        balances[0].should.be.eq.BN(new BN(100));
        balances[1].should.be.eq.BN(new BN(2));
        balances[2].should.be.eq.BN(new BN(1));
    });

    it('Should fail to mint quantity of coins larger than packed bin can represent', async () => {
        // each bin can only store numbers < 2^16
        await expectThrow(card.mint(0, alice, 150000));
    })

    it('Should update balances of sender and receiver and ownerOf for NFTs', async () => {
        //       bins :   -- 0 --  ---- 1 ----  ---- 2 ----  ---- 3 ----
        let cards  = []; //[0,1,2,3, 16,17,18,19, 32,33,34,35, 48,49,50,51];
        let copies = []; //[0,1,2,3, 12,13,14,15, 11,12,13,14, 11,12,13,14];

        let nCards = 100;

        //Minting enough copies for transfer for each cards
        for (let i = 300; i < nCards + 300; i++){
            await card.mint(i, alice);
            cards.push(i);
            copies.push(1);
        }

        const tx = await card.batchTransferFrom(alice, bob, cards, copies, {from: alice});

        let balanceFrom;
        let balanceTo;
        let ownerOf;

        for (let i = 0; i < cards.length; i++){
            balanceFrom = await card.balanceOf(alice, cards[i]);
            balanceTo   = await card.balanceOf(bob, cards[i]);
            ownerOf = await card.ownerOf(cards[i]);

            balanceFrom.should.be.eq.BN(0);
            balanceTo.should.be.eq.BN(1);
            assert.equal(ownerOf, bob);
        }

        assertEventVar(tx, 'BatchTransfer', 'from', alice)
        assertEventVar(tx, 'BatchTransfer', 'to', bob)
    })

    it('Should update balances of sender and receiver', async () => {
        //       bins :   -- 0 --  ---- 1 ----  ---- 2 ----  ---- 3 ----
        let cards  = []; //[0,1,2,3, 16,17,18,19, 32,33,34,35, 48,49,50,51];
        let copies = []; //[0,1,2,3, 12,13,14,15, 11,12,13,14, 11,12,13,14];

        let nCards = 100;
        let nCopiesPerCard = 10;

        //Minting enough copies for transfer for each cards
        for (let i = 300; i < nCards + 300; i++){
            await card.mint(i, alice, nCopiesPerCard);
            cards.push(i);
            copies.push(nCopiesPerCard);
        }

        const tx = await card.batchTransferFrom(alice, bob, cards, copies, {from: alice});

        let balanceFrom;
        let balanceTo;

        for (let i = 0; i < cards.length; i++){
            balanceFrom = await card.balanceOf(alice, cards[i]);
            balanceTo   = await card.balanceOf(bob, cards[i]);

            balanceFrom.should.be.eq.BN(0);
            balanceTo.should.be.eq.BN(copies[i]);
        }

        assertEventVar(tx, 'BatchTransfer', 'from', alice)
        assertEventVar(tx, 'BatchTransfer', 'to', bob)
    })
})
