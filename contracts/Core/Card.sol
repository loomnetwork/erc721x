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

    // fungible mint
    function mint(uint256 _tokenId, address _to, uint256 _supply) external {
        _mint(_tokenId, _to, _supply);
    }

    // nft mint
    function mint(uint256 _tokenId, address _to) external {
        _mint(_tokenId, _to);
    }
}
