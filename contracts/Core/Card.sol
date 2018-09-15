pragma solidity 0.4.24;

import "./ERC721X/ERC721XToken.sol";

// Example

contract Card is ERC721XToken {

    function name() external view returns (string) {
        return "Card";
    }

    function symbol() external view returns (string) {
        return "CRD";
    }

    // Truffle v4 does not support function overloading so we have to rename them

    // fungible mint
    function mint(uint256 _tokenId, address _to, uint256 _supply) external {
        _mint(_tokenId, _to, _supply);
    }

    // nft mint
    function mintNFT(uint256 _tokenId, address _to) external {
        _mint(_tokenId, _to);
    }

    function safeTransferFromFT(address _from, address _to, uint256 _tokenId, uint256 _amount, bytes data) public {
        safeTransferFrom(_from, _to, _tokenId, _amount, data);
    }

    function safeTransferFromNFT(address _from, address _to, uint256 _tokenId) public {
        safeTransferFrom(_from, _to, _tokenId);
    }
}
