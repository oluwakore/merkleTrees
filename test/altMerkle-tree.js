const { expect } = require('chai')
const { ethers } = require('hardhat')
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

// function hashToken(account) {
//   return Buffer.from(ethers.utils.solidityKeccak256(["address"], [account]).slice(2), "hex")
// }

function encodeLeaf(address) {
  return ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [address]
  )
}


describe("Check if the new merkle logic is efficient", function(){
  it("Should be able to verify if a given address is whitelisted or not and also add the address to the claimed whitelist mapping", async function() {

    const [owner,addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners()

    const whitelistAddresses = [
      owner.address,addr1.address, addr2.address, addr3.address, addr4.address, addr5.address, addr6.address
    ]

    const freshMerkle = new MerkleTree(
      whitelistAddresses.map((addr) => encodeLeaf(addr)),
      keccak256,
      {
        hashLeaves: true,
        sortPairs: true,
      }
    )

    const root = freshMerkle.getHexRoot()

    const netWhitelist = await ethers.getContractFactory("NetWhitelist")
    const NetWhitelist = await netWhitelist.deploy(root)
    await NetWhitelist.deployed()

    // const leaf = keccak256(whitelistAddresses[0])
    let leaf = keccak256(encodeLeaf(whitelistAddresses[0]))
    let proof = freshMerkle.getHexProof(leaf)

    await NetWhitelist.mintPresale(proof)
    
    let inWhitelist = await NetWhitelist.whitelisted(whitelistAddresses[0])
    expect(inWhitelist).to.equal(true)

    leaf = keccak256(encodeLeaf("0x93B6563f37B315B0F31ae8F3001b4c6a444E1745"))
    proof = freshMerkle.getHexProof(leaf)
    let verify = await NetWhitelist.verified(proof)
    expect(verify).to.equal(false)
  })
})